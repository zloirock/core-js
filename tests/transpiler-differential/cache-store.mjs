// The evaluation cache: (snippet, evaluation type) -> runtimeKey. Every leg is a pure function of
// the code bytes, the realm they run in and the core-js runtime they import, so an evaluation whose
// inputs are unchanged is memoized instead of re-run. That is where the run's time lives: the
// usage-global leg spawns a FRESH worker per evaluation, most of whose cost is isolate spawn and
// lazy-global warm-up paid before a single core-js module loads, and a plugin edit changes the
// output of only a small slice of the corpus - so the cost becomes proportional to the size of the
// edit rather than to the size of the corpus.
//
// Layout is GROUPED PER SNIPPET (`cases[name] = { src, <type>: cell }`), and the grouping is what
// keeps the file bounded. A cell is 1:1 with (snippet, type), so a changed output REWRITES it in
// place instead of accumulating a second entry beside it; a snippet the generator dropped disappears
// with its whole group; and the type set is finite, so even a stale cell inside a live group is
// bounded rather than growing. Three invalidation levels fall out of the shape: the group is gone
// when the name left the corpus, the group is void when `src` moved (the generator rewrote that case
// under the same name, OR the chunk prefix ahead of it did - see `beginCase`), and a cell is void
// when its own `h` moved.
//
// The cache never decides a verdict on its own. `native` is the reference the other legs are
// compared against, and the AUDIT re-runs a sampled share of the hits: a cached key that disagrees
// with a REPRODUCIBLE fresh one fails the run loudly - the one guard against a key that lost a
// dimension. Without it the symptom would be a green run that executed nothing at all.
//
// Hashing the runtime trees and sweeping dead cache files live in the coordinator rather than here:
// both are one-shot startup work over `glob`, and keeping them there leaves this module to the cache
// itself. `crypto` has no zx global, so it stays an explicit import.
import { createHash } from 'node:crypto';

const { readFile } = fs;

// which runtime tree a cell's result depends on. `native` and `arming` evaluate the raw corpus
// source, which imports no core-js at all, so they survive a runtime edit; the usage-pure legs pull
// `@core-js/pure` (its ENTRY layer, which `build-entries` generates), the usage-global ones pull
// `core-js/modules` (whose closure is modules + internals and reaches nothing else)
const RUNTIME_TYPES = {
  pure: ['pure-babel', 'pure-unplugin', 'strip-babel', 'strip-unplugin'],
  global: ['global-babel', 'global-unplugin'],
};

// one in AUDIT_EVERY hits is re-evaluated and compared. the sample rotates with the run counter
// stored in the file, so the whole cache is covered over that many runs instead of the same cells
// being the only ones ever checked. the cache test drives the rate to 1 to assert the audit fires
// (a passing audit is silent by design, so nothing else observes it) and to 0 to switch it off
// while asserting the plain hit path - a probabilistic sample would make those assertions flaky
const AUDIT_EVERY = process.env.DIFF_AUDIT_EVERY === undefined ? 100 : Number(process.env.DIFF_AUDIT_EVERY);

export const cacheStats = { hits: 0, evaluated: 0, audited: 0, volatile: 0 };
// audit disagreements are the shard's failures, not exceptions: they must ride the normal failure
// channel so the coordinator prints them next to product divergences and the run exits non-zero
export const auditFailures = [];

export function hashCode(code, ts = false) {
  // the fixed-width flag goes FIRST, so the variable-length code needs no delimiter after it
  return createHash('sha256').update(ts ? '1' : '0').update(code).digest('hex').slice(0, 16);
}

// a group's address: the snippet's own bytes AND the chunk prefix it runs behind (see `beginCase`).
// exported so nothing has to re-derive the formula - a second spelling of it would drift silently
export function caseSrc({ code, ts = false, prefix = '' }) {
  return hashCode(`${ prefix }\u0000${ code }`, ts);
}

// --- shard side ---

let loaded = null;
let round = 0;
// this shard's working set: what the coordinator merges back. it holds every cell the shard TOUCHED
// (hit or evaluated), not only the new ones, so a group is written back complete
const collected = {};
// groups the audit proved unreproducible. Dropping one from `collected` only stops this run from
// WRITING it; the copy already in the file survives the merge, so eviction needs its own channel
const evicted = new Set();
let currentName = null;
let currentTs = false;
let currentSrc = '';
// the snippet's own bytes, WITHOUT the prefix: the prefix gates the whole group through `src`, so a
// cell inside a live group is addressed by its own code alone - and a compact cell is one whose code
// IS this
let currentSourceHash = '';
let currentStored = null;
let currentSet = null;
let currentAuditing = false;
let currentHits = 0;
let currentEvaluations = 0;

// caches the load PROMISE, not the object: a value-cached variant hands the pre-read empty object to
// any caller arriving while the first read is still in flight
function loadedCases() {
  return loaded ??= (async () => {
    const file = process.env.DIFF_CACHE;
    // no path means the coordinator turned the cache off for this run (INVALIDATE_CACHE) - every
    // evaluation then runs live, and the working set still feeds the rewrite
    if (!file) return {};
    try {
      const parsed = JSON.parse(await readFile(file, 'utf8'));
      round = parsed.round ?? 0;
      return parsed.cases ?? {};
    } catch {
      // absent or torn cache - everything just evaluates
      return {};
    }
  })();
}

// a cell is either `{ h, r }` or a bare string, which means "this code IS the snippet source" -
// `native` and `arming` evaluate the raw source, so storing their hash again would repeat what the
// group already implies
function cellHash(cell, sourceHash) {
  return typeof cell === 'string' ? sourceHash : cell?.h;
}
function cellValue(cell) {
  return typeof cell === 'string' ? cell : cell?.r;
}

// enter a snippet: everything cached until the next call belongs to this group. a `src` mismatch
// voids the whole stored group - the generator rewrote this case under its old name, so none of its
// outputs describe the current one.
//
// `live` forces every cell of this group to run. The group is the unit here, not the cell, because a
// snippet's cells are compared AGAINST EACH OTHER - the polyfilled outputs against the native
// reference - so they have to be observed in the same state of the realm. A snippet whose result
// depends on more than its own code (the corpus has shapes that read how many properties `globalThis`
// carries, which grows as modules load) would otherwise be judged by mixing a value recorded in one
// run with one produced in another, and diverge for a reason the product had nothing to do with.
export async function beginCase({ name, code, ts = false, live = false, prefix = '' }) {
  const cases = await loadedCases();
  currentName = name;
  currentTs = ts;
  // the PREFIX is part of the address, not decoration: snippets run sequentially in one realm and
  // the corpus mutates globals on purpose (`Array.of = patched`, `globalThis.Map = shim`), so what a
  // snippet observes depends on which ones ran before it in its chunk. Fold it into `src` and a
  // shifted prefix voids the whole group, which is exactly right - the recorded values described a
  // realm that no longer exists. A plugin edit leaves the prefix untouched and keeps the cache warm;
  // a corpus edit invalidates what follows it, which is the work that genuinely has to be redone
  currentSrc = caseSrc({ code, ts, prefix });
  currentSourceHash = hashCode(code, ts);
  const stored = cases[name];
  currentStored = !live && stored?.src === currentSrc ? stored : null;
  // the audit keeps the stored group for COMPARISON while running every cell of it: sampling one
  // cell out of an otherwise cached group is exactly the mixing described above
  currentAuditing = Boolean(currentStored) && auditDue(currentSrc);
  currentHits = 0;
  currentEvaluations = 0;
  currentSet = collected[name] = { src: currentSrc };
}

// did this group answer partly from the cache and partly from live runs? such a verdict compared
// values observed at different times, so a FAILING one is re-played live before it is believed
export function mixedCase() {
  return currentHits > 0 && currentEvaluations > 0;
}

// records one cell, unless the value is not worth remembering: a crash sentinel is a transient
// rather than a result - cached, it would pin the snippet broken forever instead of being re-probed.
// A group the audit found unreproducible needs no guard here: dropping it from `collected` orphans
// the object this writes into, so every later cell of that group lands nowhere observable
function store(type, hash, value) {
  if (value.startsWith('WORKER-CRASH|') || value.startsWith('stripped-worker-died:')) return;
  currentSet[type] = hash === currentSourceHash ? value : { h: hash, r: value };
}

function auditDue(hash) {
  return AUDIT_EVERY > 0 && parseInt(hash.slice(0, 4), 16) % AUDIT_EVERY === round % AUDIT_EVERY;
}

// the memoized evaluation. `evaluate` returns the runtimeKey of running `code` in this type's realm
export async function cached({ type, code, evaluate }) {
  const hash = hashCode(code, currentTs);
  const stored = currentStored?.[type];
  const hit = cellHash(stored, currentSourceHash) === hash ? cellValue(stored) : undefined;
  if (hit !== undefined && !currentAuditing) {
    cacheStats.hits++;
    currentHits++;
    currentSet[type] = stored;
    return hit;
  }
  const fresh = await evaluate();
  if (hit === undefined) {
    cacheStats.evaluated++;
    currentEvaluations++;
  } else {
    cacheStats.audited++;
    // a disagreement has two possible causes, and telling them apart needs one more run rather than
    // a judgement call: EITHER the key lost a dimension (something moved the result without moving
    // the key), and then a second run reproduces `fresh` exactly - the loud failure this guard
    // exists for - OR the snippet is not a function of its code alone (the corpus has shapes that
    // count the properties of `globalThis`, which grows as modules load), and then the second run
    // disagrees with the first as well. The latter can never be cached: a value recorded in one run
    // is compared against another run's state, so it would report forever. Second runs cost worker
    // spawns, which is why only a disagreement pays for one
    if (fresh !== hit) {
      const second = await evaluate();
      if (second === fresh) {
        auditFailures.push(`${ currentName } :: CACHE AUDIT ${ type } - cached=${ hit } fresh=${ fresh }`);
      } else {
        cacheStats.volatile++;
        evicted.add(currentName);
        delete collected[currentName];
      }
    }
  }
  store(type, hash, fresh);
  return fresh;
}

// drop everything this snippet produced. A FAILING snippet is never cached: an evaluation that
// disagrees with its native reference is either a real divergence - which must keep executing, so
// the next run sees the product's answer rather than a recorded one - or an infrastructure hiccup,
// and those are indistinguishable here. A spawn that died mid-import lands as a plain `ERR|Error`,
// not as a crash sentinel, so caching it would pin the snippet red forever with a failure nobody
// can reproduce by hand. Green snippets are the only ones worth memoizing.
export function discardCase(name) {
  delete collected[name];
}

export function collectCases() {
  return collected;
}

export function collectEvicted() {
  return [...evicted];
}

// --- coordinator side ---

// drop every cell whose runtime stamp moved, keeping the rest: `native` / `arming` never load
// core-js, and the two plugin flavours pull different trees, so a pure-runtime edit must not throw
// the usage-global results away (nor the other way round)
export function applyRuntimeStamps(parsed, runtime) {
  const stale = [];
  for (const [tree, types] of Object.entries(RUNTIME_TYPES)) {
    if (parsed.runtime?.[tree] !== runtime[tree]) stale.push(...types);
  }
  if (!stale.length) return { cases: parsed.cases ?? {}, stale };
  const cases = {};
  for (const [name, group] of Object.entries(parsed.cases ?? {})) {
    const kept = {};
    for (const [type, cell] of Object.entries(group)) if (!stale.includes(type)) kept[type] = cell;
    cases[name] = kept;
  }
  return { cases, stale };
}

// merge the shards' working sets over the existing cases. cell-level, so a scoped run (which never
// touches the emitter or leg it skipped) leaves those cells alone instead of dropping them; and
// groups whose name left the corpus are dropped, which is what keeps the file at corpus size.
// `reset` is the manual invalidation: the stored contents are ignored entirely, so the file ends up
// holding exactly what this run computed. It lives here rather than at the call site because a
// decision made in the coordinator is a decision no test can reach
export function mergeCases({ existing, sets, names, evicted: dropped = [], reset = false }) {
  const merged = {};
  const drop = new Set(dropped);
  const kept = reset ? {} : existing;
  for (const [name, group] of Object.entries(kept)) if (names.has(name) && !drop.has(name)) merged[name] = group;
  for (const set of sets) {
    for (const [name, group] of Object.entries(set)) {
      if (!names.has(name)) continue;
      const previous = merged[name]?.src === group.src ? merged[name] : {};
      merged[name] = { ...previous, ...group };
    }
  }
  return merged;
}

// a plain counter: the sample period is applied where it belongs, in `auditDue`, so the rate can
// change (or be switched off) without the stored counter meaning something different afterwards
export function nextRound(parsed) {
  return (parsed?.round ?? 0) + 1;
}
