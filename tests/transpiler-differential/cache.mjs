// The evaluation cache, checked where it can lie rather than where it saves time. A cache that
// answers with a stale key turns a differential run GREEN while executing nothing at all, so the
// assertions here are about the boundaries of a hit: what voids a cell (its own code moved), what
// voids a whole group (the generator rewrote that case), what voids a class of cells (the core-js
// runtime under them moved), what must never be stored (a crash sentinel), and that the AUDIT -
// the only guard against a key that lost a dimension - actually fires and actually reports.
//
// The unit half drives cache-store directly against a planted file; the shard half forks a real
// chunk twice and compares the two verdicts, which is the property the whole design rests on: a hot
// run must produce exactly what the cold one did.
import { fileURLToPath } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { ensureDir, outputFile, readJson, removeSync, writeJson } = fs;
const { dirname, join } = path;
const { check, checkDeep, finish } = createChecker('differential-cache');

// NOT the ambient `__dirname`: zxi IMPORTS this file rather than running it as the entry point, so
// that global points at the bootstrap's directory
const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, 'tmp', `cache-test-${ process.pid }`);
const CACHE = join(TMP, 'cache.json');
await ensureDir(TMP);
// on EXIT rather than at the end of the file: an assertion that throws, or a shard that dies
// mid-probe, would otherwise leave the planted fixtures behind for someone else to find
// eslint-disable-next-line node/no-sync -- an exit handler cannot await, and this is its whole point
process.on('exit', () => removeSync(TMP));

// --- unit: cell boundaries ---
// planted BEFORE the module loads: the store reads its path and its audit rate once, and the hit
// path must be asserted with the audit off - a sampled re-evaluation would make it flaky
const PLANTED = {
  round: 0,
  runtime: { pure: 'p', global: 'g' },
  cases: {
    hit: { src: 'ffffffffffffffff', 'pure-babel': { h: 'aaaaaaaaaaaaaaaa', r: 'OK|cached' } },
    moved: { src: 'ffffffffffffffff', 'pure-babel': { h: 'stale00000000000', r: 'OK|stale' } },
    rewritten: { src: 'not-the-source00', 'pure-babel': { h: 'aaaaaaaaaaaaaaaa', r: 'OK|stale' } },
  },
};
await writeJson(CACHE, PLANTED);
process.env.DIFF_CACHE = CACHE;
process.env.DIFF_AUDIT_EVERY = '0';
const store = await import('./cache-store.mjs');
const { applyRuntimeStamps, beginCase, cached, collectCases, discardCase, hashCode, mergeCases, mixedCase, nextRound } = store;

check('hashCode separates the TS flag', hashCode('x', true) === hashCode('x', false), false);

// a planted cell is addressed by the hashes the store itself computes, so the fixture is built from
// them rather than from literals that would drift the moment the hashing changes
const SRC = 'export const r = 1;';
const OUT = 'import "core-js/modules/es.array.at";\nexport const r = 1;';
const srcHash = hashCode(SRC);
const outHash = hashCode(OUT);
await writeJson(CACHE, {
  round: 0,
  runtime: { pure: 'p', global: 'g' },
  cases: {
    live: { src: srcHash, native: 'OK|planted-native', 'pure-babel': { h: outHash, r: 'OK|planted-out' } },
    moved: { src: srcHash, 'pure-babel': { h: 'stale00000000000', r: 'OK|stale' } },
    rewritten: { src: 'not-the-source00', native: 'OK|stale', 'pure-babel': { h: outHash, r: 'OK|stale' } },
  },
});

async function evaluated(name, type, code, value = 'OK|fresh') {
  let ran = false;
  function evaluate() {
    ran = true;
    return value;
  }
  const key = await cached({ type, code, evaluate });
  return { ran, key, name };
}

await beginCase({ name: 'live', code: SRC });
checkDeep('a matching cell answers without evaluating', await evaluated('live', 'pure-babel', OUT), { ran: false, key: 'OK|planted-out', name: 'live' });
check('a source-code cell is stored bare', (await readJson(CACHE)).cases.live.native, 'OK|planted-native');
// same bytes, different realm: the type is what separates them, and a shared key would hand one
// realm's answer to the other
checkDeep('a second type over the SAME code evaluates', await evaluated('live', 'strip-babel', OUT, 'OK|stripped'), { ran: true, key: 'OK|stripped', name: 'live' });
checkDeep('both cells survive in the working set', [collectCases().live['pure-babel'].r, collectCases().live['strip-babel'].r], ['OK|planted-out', 'OK|stripped']);

await beginCase({ name: 'moved', code: SRC });
check('a cell whose code moved evaluates', (await evaluated('moved', 'pure-babel', OUT)).ran, true);

await beginCase({ name: 'rewritten', code: SRC });
check('a group whose source moved is void', (await evaluated('rewritten', 'pure-babel', OUT)).ran, true);
check('  and its source-side cell too', (await evaluated('rewritten', 'native', SRC)).ran, true);
check('  and the group carries the new src', collectCases().rewritten.src, srcHash);

// the audit takes the GROUP, never a single cell: a snippet's cells are compared against each other,
// so sampling one out of an otherwise cached group would judge a fresh value against a recorded one
await beginCase({ name: 'live', code: SRC });
checkDeep('a group is not mixed when every cell hits', [(await evaluated('live', 'pure-babel', OUT)).ran, mixedCase()], [false, false]);
checkDeep('  and mixing a miss into it is reported', [(await evaluated('live', 'strip-babel', OUT)).ran, mixedCase()], [true, true]);
// `live` forces the whole group to run even where the stored cells still match
await beginCase({ name: 'live', code: SRC, live: true });
check('a live group runs every cell', (await evaluated('live', 'pure-babel', OUT)).ran, true);
check('  and is therefore not mixed', mixedCase(), false);

// an audit disagreement has two causes and they demand opposite reactions: a key that lost a
// dimension must fail the run, a snippet that is not a function of its code alone must simply never
// be cached. The discriminator is a second run - reproducible means the key is at fault
process.env.DIFF_AUDIT_EVERY = '1';
const auditing = await import('./cache-store.mjs?audit=1');
await auditing.beginCase({ name: 'live', code: SRC });
let stableRuns = 0;
function reproducible() {
  stableRuns++;
  return 'OK|reproducible';
}
await auditing.cached({ type: 'pure-babel', code: OUT, evaluate: reproducible });
check('a reproducible disagreement is reported as a stale key', auditing.auditFailures.length, 1);
check('  after a confirming second run', stableRuns, 2);
let drift = 0;
await auditing.beginCase({ name: 'live', code: SRC });
await auditing.cached({ type: 'pure-babel', code: OUT, evaluate: () => `OK|drift-${ drift++ }` });
check('an unreproducible one is not reported', auditing.auditFailures.length, 1);
check('  and its group is dropped instead of cached', auditing.collectCases().live, undefined);
check('  counted as not cacheable', auditing.cacheStats.volatile, 1);
// the drop has to survive the REST of the group: cells evaluated after it must not resurrect it
await auditing.cached({ type: 'strip-babel', code: OUT, evaluate: () => 'OK|later-cell' });
check('  and a later cell does not resurrect it', auditing.collectCases().live, undefined);
// dropping it from the working set only stops this run from WRITING it - the copy already in the
// file outlives the merge unless eviction travels as its own channel
checkDeep('  and it is reported for eviction', auditing.collectEvicted(), ['live']);
process.env.DIFF_AUDIT_EVERY = '0';

// the audit is a SAMPLE that rotates: at a rate above 1 it must take some groups and leave others,
// and a different round must take a different set. Rates 0 and 1 cannot see either property - both
// behave identically whether the sample is computed or not
async function auditedShare(rate, round) {
  const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const file = join(TMP, `sample-${ rate }-${ round }.json`);
  const cases = {};
  for (const name of names) cases[name] = { src: hashCode(name), native: 'OK|planted' };
  await writeJson(file, { round, cases });
  process.env.DIFF_CACHE = file;
  process.env.DIFF_AUDIT_EVERY = String(rate);
  const module = await import(`./cache-store.mjs?sample=${ rate }-${ round }`);
  const taken = [];
  for (const name of names) {
    await module.beginCase({ name, code: name });
    await module.cached({ type: 'native', code: name, evaluate: () => 'OK|planted' });
    if (module.cacheStats.audited > taken.length) taken.push(name);
  }
  return taken;
}
const sampleA = await auditedShare(3, 0);
check('the audit takes a strict subset, not everything', sampleA.length > 0 && sampleA.length < 8, true);
const sampleB = await auditedShare(3, 1);
check('  and a different round takes a different set', JSON.stringify(sampleA) === JSON.stringify(sampleB), false);
process.env.DIFF_CACHE = CACHE;
process.env.DIFF_AUDIT_EVERY = '0';

await beginCase({ name: 'sentinels', code: SRC });
await cached({ type: 'global-babel', code: OUT, evaluate: () => 'WORKER-CRASH|boom' });
await cached({ type: 'global-unplugin', code: OUT, evaluate: () => 'stripped-worker-died: gone' });
checkDeep('crash sentinels are not stored', Object.keys(collectCases().sentinels), ['src']);

// a failing snippet must leave NOTHING behind. a worker that dies mid-import lands as a plain
// `ERR|Error`, indistinguishable from a snippet that legitimately throws, so a cached failure would
// pin the case red forever with a divergence nobody can reproduce by hand
await beginCase({ name: 'failing', code: SRC });
await cached({ type: 'pure-babel', code: OUT, evaluate: () => 'ERR|Error' });
discardCase('failing');
check('a failing snippet caches nothing', collectCases().failing, undefined);

// --- unit: runtime stamps ---
const STAMPED = {
  runtime: { pure: 'p', global: 'g' },
  cases: { one: { src: 's', native: 'n', arming: 'a', 'pure-babel': { h: 'x', r: 'r' }, 'global-babel': { h: 'y', r: 'r' } } },
};
checkDeep('matching stamps keep everything', applyRuntimeStamps(STAMPED, { pure: 'p', global: 'g' }).stale, []);
const purePart = applyRuntimeStamps(STAMPED, { pure: 'MOVED', global: 'g' });
checkDeep('a pure-runtime edit drops only pure cells', Object.keys(purePart.cases.one).sort(), ['arming', 'global-babel', 'native', 'src']);
const globalPart = applyRuntimeStamps(STAMPED, { pure: 'p', global: 'MOVED' });
checkDeep('a global-runtime edit drops only global cells', Object.keys(globalPart.cases.one).sort(), ['arming', 'native', 'pure-babel', 'src']);
checkDeep('  and the raw-source cells never depend on a runtime', [purePart.cases.one.native, globalPart.cases.one.arming], ['n', 'a']);

// --- unit: merge and liveness ---
const existing = {
  kept: { src: 's', native: 'old', 'global-babel': { h: 'g', r: 'untouched' } },
  dropped: { src: 's', native: 'old' },
};
const merged = mergeCases({
  existing,
  sets: [{ kept: { src: 's', native: 'new' } }, { unknown: { src: 's', native: 'new' } }],
  names: new Set(['kept']),
});
checkDeep('a name outside the corpus is dropped', Object.keys(merged), ['kept']);
check('a shard set overwrites the cells it carries', merged.kept.native, 'new');
checkDeep('  and leaves the cells it never touched', merged.kept['global-babel'], { h: 'g', r: 'untouched' });
const evictedOut = mergeCases({ existing, sets: [], names: new Set(['kept', 'dropped']), evicted: ['kept'] });
checkDeep('an evicted group leaves the file even when the shard wrote nothing', Object.keys(evictedOut), ['dropped']);
// manual invalidation: the file must end up holding exactly what the run computed, so a group the
// run never touched cannot survive from the stored copy
const afterReset = mergeCases({ existing, sets: [{ kept: { src: 's', native: 'new' } }], names: new Set(['kept', 'dropped']), reset: true });
checkDeep('a reset drops every stored group the run did not recompute', Object.keys(afterReset), ['kept']);
checkDeep('  and keeps what it did', afterReset.kept, { src: 's', native: 'new' });
const rewritten = mergeCases({ existing, sets: [{ kept: { src: 'MOVED', native: 'new' } }], names: new Set(['kept']) });
checkDeep('a moved src replaces the group instead of merging over it', Object.keys(rewritten.kept).sort(), ['native', 'src']);
check('the audit round advances', nextRound({ round: 3 }), 4);

// --- shard: a hot run reproduces the cold one ---
// a small slice of the real corpus, so the assertions run against real outputs and real realms
const SHARD = '0/1500';
const SHARD_TMP = join(TMP, 'shard');
const MARKER = /@@SHARD@@(?<json>.*)@@/u;
// the shard streams progress on stderr and its single result line on stdout; `quiet` keeps both out
// of the test's own output (zxi turns $.verbose on globally) while still capturing them
async function runShard({ cache = '', audit = '0', legs = 'full', emitter = 'both' } = {}) {
  const env = {
    ...process.env,
    DIFF_SHARD: SHARD,
    DIFF_TMP: SHARD_TMP,
    DIFF_LEGS: legs,
    DIFF_EMITTER: emitter,
    DIFF_CACHE: cache,
    DIFF_AUDIT_EVERY: audit,
  };
  const { stdout } = await $({ env, quiet: true })`node ${ join(HERE, 'shard.mjs') }`;
  const found = MARKER.exec(stdout);
  if (!found) throw new Error('chunk produced no result');
  return JSON.parse(found.groups.json);
}
function verdictOf(result) {
  return { passed: result.passed, failures: result.failures, armed: result.globalArmed, checked: result.globalChecked };
}

const SHARD_CACHE = join(TMP, 'shard-cache.json');
const cold = await runShard();
checkDeep('the cold run evaluates and fails nothing', [cold.cacheStats.hits, cold.failures.length], [0, 0]);
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: cold.cases });
const hot = await runShard({ cache: SHARD_CACHE });
checkDeep('the hot run reproduces the cold verdict', verdictOf(hot), verdictOf(cold));
check('  having evaluated nothing', hot.cacheStats.evaluated, 0);
check('  and having hit every cell the cold run wrote', hot.cacheStats.hits, cold.cacheStats.evaluated);

// fail-before for the audit: without it, a stale cell IS a silent green run
const poisoned = {};
for (const [name, group] of Object.entries(cold.cases)) {
  poisoned[name] = Object.fromEntries(Object.entries(group).map(([type, cell]) => {
    if (type === 'src') return [type, cell];
    return [type, typeof cell === 'string' ? 'OK|"poisoned"|[]' : { h: cell.h, r: 'OK|"poisoned"|[]' }];
  }));
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: poisoned });
const unaudited = await runShard({ cache: SHARD_CACHE });
checkDeep('a poisoned cache passes silently when the audit is off', [unaudited.failures.length, unaudited.cacheStats.audited], [0, 0]);
const audited = await runShard({ cache: SHARD_CACHE, audit: '1' });
check('the audit re-evaluates every hit at rate 1', audited.cacheStats.audited, hot.cacheStats.hits);
check('  and reports every poisoned cell', audited.failures.filter(line => line.includes('CACHE AUDIT')).length, audited.cacheStats.audited);

// the same rule end to end: poison ONE cell so the snippet's legs disagree, and the shard must
// report the divergence AND leave the whole group out of its working set. poisoning every cell
// (above) keeps them agreeing with each other, which is why that run passes silently
const desynced = {};
for (const [name, group] of Object.entries(cold.cases)) {
  desynced[name] = { ...group, native: 'OK|"desynced"|[]' };
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: desynced });
const diverged = await runShard({ cache: SHARD_CACHE });
// every cell here comes from the cache, so the group is NOT mixed and the replay does not apply:
// the divergence is reported and nothing is written back
const stillFailing = new Set(diverged.failures.map(line => line.split(' :: ', 1)[0]));
check('a wholly cached group reports its divergence', diverged.failures.length > 0, true);
checkDeep('  and no snippet that still fails is written back', [...stillFailing].filter(name => name in diverged.cases), []);

// a MIXED group is the case the replay exists for: poison the reference AND delete one output cell,
// so the verdict would compare a recorded value against a freshly produced one. Replayed live, every
// snippet recovers - which is what discriminates the replay from its absence
const mixedCache = {};
for (const [name, group] of Object.entries(cold.cases)) {
  const copy = { ...group, native: 'OK|"poisoned-reference"|[]' };
  delete copy['pure-babel'];
  mixedCache[name] = copy;
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: mixedCache });
const replayed = await runShard({ cache: SHARD_CACHE });
checkDeep('a mixed group is replayed live instead of believed', replayed.failures, []);
check('  and every replayed snippet is written back', Object.keys(replayed.cases).length, Object.keys(cold.cases).length);
// the replay runs both oracles a second time, so its per-snippet counters must stay per-snippet
checkDeep('  counted once, not twice', [replayed.globalChecked, replayed.passed], [cold.globalChecked, cold.passed]);
// NOT asserted here: that the eviction list travels shard -> marker -> merge, that a HARNESS CRASH
// drops its group, and that the coordinator honours `reset` / the corpus liveness set. All four need
// a volatile snippet or a coordinator run, and this suite forks shards only - a `[]`-shaped
// assertion would pass against a channel that carries nothing. The cycle log records them as covered
// by the full run instead of pretending otherwise

// a scoped run must write only the cells it actually computed, and must not disturb the ones it
// skipped: the edit-loop tokens are what make the cache usable mid-work, so their shape is part of
// the contract rather than a convenience
function typesOf(result) {
  const types = new Set();
  for (const group of Object.values(result.cases)) for (const type of Object.keys(group)) types.add(type);
  return [...types].sort();
}
const pureOnly = await runShard({ legs: 'pure' });
checkDeep('a pure-only run writes no usage-global cells', typesOf(pureOnly).filter(type => type.startsWith('global-')), []);
check('  and still writes the pure ones', typesOf(pureOnly).includes('pure-babel'), true);
const babelOnly = await runShard({ emitter: 'babel' });
checkDeep('a babel-only run writes no unplugin cells', typesOf(babelOnly).filter(type => type.endsWith('-unplugin')), []);
const unpluginOnly = await runShard({ emitter: 'unplugin' });
checkDeep('an unplugin-only run writes no babel cells', typesOf(unpluginOnly).filter(type => type.endsWith('-babel')), []);

const torn = join(TMP, 'torn.json');
await outputFile(torn, '{ not json');
const afterTorn = await runShard({ cache: torn });
checkDeep('a torn cache file evaluates instead of failing', verdictOf(afterTorn), verdictOf(cold));
const missing = await runShard({ cache: join(TMP, 'no-such-file.json') });
checkDeep('an absent cache file does the same', verdictOf(missing), verdictOf(cold));

finish();
