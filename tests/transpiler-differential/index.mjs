// Transpiler-differential coordinator: a differential parity check over GENERATED inputs. Each snippet
// passes when babel-plugin and unplugin agree on the injected import-set AND on runtime behaviour
// (native == babel == unplugin), neither plugin throws, and (for grammar snippets) the polyfilled
// output reproduces native in a builtin-absent realm. Body-shape (AST codegen vs text rewrite) is
// NOT compared - that divergence is the architectural sidecar, not a bug.
//
// Parallelism is by PROCESS CHUNKING, not in-process concurrency: the corpus mutates globals
// (`Array.of = patched`, `globalThis.Map = shim`), so a shared realm would let concurrent runs
// interleave (a promise-pool produced false fails). The corpus splits into CHUNKS - each one a
// fresh shard.mjs process running its subset sequentially in its own realm - and a bounded pool
// runs at most CONCURRENCY of them at once (~cores/2: each chunk also forks ONE stripped worker,
// so half the cores keeps the total process count near the core count). The chunk count is a whole
// number of pool passes - one chunk per slot, doubled and tripled as the per-process snippet cap
// below demands - so a growing corpus never leaves a half-empty tail pass with idle slots, whatever
// its size. A chunk that dies without a result is retried once in a fresh process (see the pool) -
// the Windows worker-teardown race is probabilistic, a deterministic crash still fails on its
// second death.
import { fork } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyRuntimeStamps, mergeCases, nextRound } from './cache-store.mjs';
import { generate } from './generate.mjs';

const { cyan, green, red } = chalk;
const { ensureDir, readdir, remove } = fs;
const { join } = path;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const TMP_ROOT = join(HERE, 'tmp');
// this run's own subdirectory: concurrent runs must never share a tree - the old whole-root
// clear raced a concurrent run's live writers (rm walks the dir, a writer adds a file, the
// final rmdir hits ENOTEMPTY) and swept its modules mid-import
const TMP = join(TMP_ROOT, `run-${ process.pid }`);
const CONCURRENCY = Math.max(1, Math.floor(os.cpus().length / 2));
// hard cap on snippets per chunk PROCESS, independent of the concurrency above: every full-env
// evaluation dynamic-imports fresh temp modules into the shard (and its stripped worker), and an
// ESM module cache only dies with its process - a low-core runner packing the whole corpus into
// one long-lived shard grows past the CI memory limit and is OOM-killed mid-run ("produced no
// result", no stack). a shard measures ~0.1MB per snippet over a ~500MB floor, so this size holds
// one around 650MB - the whole corpus in a single process is around a gigabyte. this is the only
// input to how many passes the pool makes, never a tuning knob for the chunk count itself
const SHARD_CAP = 1500;

// each eval writes a fresh temp module (dynamic-import never reuses a URL), so trees grow
// unbounded across runs. reap ONLY dead runs' trees (a killed run never cleans after itself)
// plus legacy shared-root files; a live pid keeps its tree untouched
await ensureDir(TMP_ROOT);
for (const entry of await readdir(TMP_ROOT)) {
  const found = /^run-(?<pid>\d+)$/u.exec(entry);
  let dead = true;
  if (found) {
    try {
      process.kill(Number(found.groups.pid), 0);
      dead = false;
    } catch {
      // signal 0 threw - no such process, the tree is stale
    }
  }
  if (dead) await remove(join(TMP_ROOT, entry));
}
await ensureDir(TMP);

// generation is cheap string building (no transforms), so the corpus is materialized just to size
// the pool. the count is a MULTIPLE of the slot count: the corpus splits evenly over the slots, and
// each slot's share splits again only when it would breach the memory cap. sizing the count from
// the cap alone leaves a partly idle tail pass whenever the corpus is not a neat multiple of it.
// the NAMES ride along as the cache's liveness set: a group whose snippet the generator dropped is
// dropped with it, which is what holds the file at corpus size instead of letting it grow forever
const corpusNames = new Set();
let corpusTotal = 0;
for (const snippet of generate()) {
  corpusNames.add(snippet.name);
  corpusTotal++;
}
const CHUNKS = CONCURRENCY * Math.max(1, Math.ceil(corpusTotal / SHARD_CAP / CONCURRENCY));

// edit-loop scoping, combinable positional tokens - gates always run the unscoped default:
// `pure` skips the usage-global leg (the bulk of the run per the phase profile); `babel` /
// `unplugin` runs a single emitter, which turns the import-parity oracle OFF
const tokens = new Set(argv._);
for (const token of tokens) {
  if (!['pure', 'babel', 'unplugin'].includes(token)) {
    throw new Error(`unknown differential mode '${ token }' - supported: pure, babel, unplugin (combinable)`);
  }
}
if (tokens.has('babel') && tokens.has('unplugin')) throw new Error('babel + unplugin is the default - drop both tokens');
const PURE_ONLY = tokens.has('pure');
const EMITTER = tokens.has('babel') ? 'babel' : tokens.has('unplugin') ? 'unplugin' : 'both';

echo(green(`Transpiler differential: ${ cyan(corpusTotal) } snippets in ${ cyan(CHUNKS) } chunks (${ cyan(CONCURRENCY) } concurrent), four oracles per snippet (full-env three-way + pure stripped worker + the print-through + usage-global stripped realm); progress streams below every ${ cyan(100) } snippets`));
if (PURE_ONLY) echo(red('PURE-ONLY RUN: the usage-global leg is SKIPPED - not a full verification, gates need the default run'));
if (EMITTER !== 'both') echo(red(`SINGLE-EMITTER RUN (${ EMITTER }): the other emitter and the import-parity oracle are OFF - not a full verification`));

// the evaluation cache (see cache-store.mjs): valid only for THIS machinery - every file a result
// flows through (both legs and their workers, the manifest, the serializer, the harness's
// writeModule / TS-strip, the shard's ordering, the alias rig the raw snippets import), the babel
// packages doing that strip, and the node binary. the hash keys the FILENAME, so branches and
// machinery edits coexist instead of poisoning each other. the plugins under test are absent on
// purpose - a changed output invalidates its own cell by its own hash, which is exactly the
// property that makes an edit cost proportional to its size
const CACHE_MACHINERY = [
  'cache-store.mjs',
  'global-leg.mjs',
  'global-leg-worker.mjs',
  'harness.mjs',
  'rig-aliases.mjs',
  'serialize.mjs',
  'shard.mjs',
  'strip-builtins.mjs',
  'strip-manifest.mjs',
  'stripped-worker.mjs',
];
const STRIP_DEPS = ['@babel/core', '@babel/plugin-transform-typescript', '@babel/plugin-proposal-decorators', '@babel/plugin-transform-class-properties'];
// NUL between parts: a bare concat would let two different states hash equal when bytes move
// across a boundary (file tail to next file head, version digit to the next version)
const machinery = createHash('sha256');
for (const name of CACHE_MACHINERY) machinery.update(await fs.readFile(join(HERE, name))).update('\0');
for (const name of STRIP_DEPS) machinery.update((await fs.readJson(join(ROOT, 'node_modules', name, 'package.json'))).version).update('\0');
machinery.update(process.version);
const CACHE_DIR = join(os.homedir(), '.cache', 'core-js-differential');
const CACHE_NAME = `cache-${ machinery.digest('hex').slice(0, 12) }.json`;
const CACHE_FILE = join(CACHE_DIR, CACHE_NAME);
// the runtime a cached result depends on is NOT in the code that produced it: an output is a list
// of imports, so a polyfill edit moves the result without moving a single byte of the output. the
// two flavours pull different trees (usage-pure the generated `@core-js/pure` entry layer,
// usage-global `core-js/modules` and its internals closure), and the raw-source cells depend on
// neither - so the stamps live per tree in the file header and void only their own cell types
// only what a run actually loads: the modules and the manifests that resolve them. READMEs and
// ignore files sit in the same directories and change far more often than the code does, and
// counting them would throw the cache away on a documentation edit. content, never mtime - an
// idempotent `npm run prepare` rewrites the generated pure tree with identical bytes
async function hashTree(roots) {
  const found = await Promise.all(roots.map(root => glob(['**/*.js', '**/package.json'], { cwd: root, absolute: true, onlyFiles: true })));
  const files = found.flat().sort();
  const hash = createHash('sha256');
  // NUL between parts: a bare concat would let two different trees hash equal when bytes move
  // across a boundary (a path tail into the next file's head)
  for (const file of files) hash.update(file).update('\0').update(await fs.readFile(file)).update('\0');
  return hash.digest('hex').slice(0, 12);
}
const PURE_TREE = [join(ROOT, 'packages', 'core-js-pure')];
const GLOBAL_TREE = [join(ROOT, 'packages', 'core-js', 'modules'), join(ROOT, 'packages', 'core-js', 'internals')];
const [pureStamp, globalStamp] = await Promise.all([hashTree(PURE_TREE), hashTree(GLOBAL_TREE)]);
const runtime = { pure: pureStamp, global: globalStamp };
// manual reset, for a suspicion the hashes above cannot express. It discards the CONTENTS; the file
// is still read, because the audit's rotation counter is coverage bookkeeping rather than cached
// data - resetting it would restart the sample from the same cells after every manual reset
const INVALIDATE = process.env.INVALIDATE_CACHE === '1';
let stored = {};
try {
  stored = await fs.readJson(CACHE_FILE);
} catch { /* first run for this machinery, or a torn file - everything just evaluates */ }
const { cases: liveCases, stale } = applyRuntimeStamps(stored, runtime);
// a first run for this machinery has no stamps to match, which is not a runtime change
const hadCache = Boolean(Object.keys(stored.cases ?? {}).length);
async function writeCache(payload) {
  await ensureDir(CACHE_DIR);
  const tmpFile = `${ CACHE_FILE }.${ process.pid }.tmp`;
  await fs.writeJson(tmpFile, payload);
  await fs.rename(tmpFile, CACHE_FILE);
}
// the shards read the FILE, so a runtime-voided cell has to be gone from it BEFORE they fork -
// rewriting here is what makes the header stamps effective rather than advisory
if (stale.length && hadCache && !INVALIDATE) await writeCache({ round: stored.round ?? 0, runtime, cases: liveCases });
if (INVALIDATE) echo(red('INVALIDATE_CACHE=1: the evaluation cache is ignored - every leg runs live and the file is rewritten'));
else if (stale.length && hadCache) echo(`core-js runtime changed: ${ cyan(stale.join(', ')) } cells dropped, the rest kept`);

const MARKER = /@@SHARD@@(?<json>.*)@@/u;
const children = [];
function runChunk(chunk) {
  return new Promise((resolve, reject) => {
    // execArgv: [] so the shard (a file module) does not inherit a loader / --input-type flag
    const child = fork(join(HERE, 'shard.mjs'), [], {
      execArgv: [],
      env: {
        ...process.env,
        DIFF_SHARD: `${ chunk }/${ CHUNKS }`,
        DIFF_TMP: TMP,
        DIFF_LEGS: PURE_ONLY ? 'pure' : 'full',
        DIFF_EMITTER: EMITTER,
        // empty path = no cache to read; the shard still reports its working set, so the run
        // rewrites the file from live evaluations
        DIFF_CACHE: INVALIDATE ? '' : CACHE_FILE,
      },
      stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
    });
    children.push(child);
    let buf = '';
    child.stdout.on('data', d => { buf += d; });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      const found = MARKER.exec(buf);
      // code/signal in the message: a silent SIGKILL death (the OOM killer) is otherwise
      // indistinguishable from a marker-less clean exit in the CI log
      if (!found) return reject(new Error(`chunk ${ chunk } produced no result (exit code ${ code }, signal ${ signal })`));
      resolve(JSON.parse(found.groups.json));
    });
  });
}

// bounded pool: at most CONCURRENCY chunk processes alive at once, the rest queue. each finished
// chunk frees its whole process tree (ESM caches, stripped worker) before the next starts.
// a marker-less chunk death gets ONE retry in a fresh process: the worker-thread churn the
// usage-global leg lives on is exposed to a NATIVE teardown race on Windows (0xC0000005) that
// no JS-side ordering fully closes - a probabilistic crash must not fail the whole run, while
// a DETERMINISTIC one still fails loudly on its second identical death. the crashed chunk's
// snippets all re-run (its accumulated verdicts died with it), so a real product divergence
// can never hide behind the retry.
// `aborted` gates BOTH new chunks and retries: after a terminal failure the coordinator's
// kill sweep tears the survivors down, and a retry forked past it (a sweep-killed sibling
// lands in the same catch) would outlive the run as an orphan
async function runAllChunks() {
  const results = new Array(CHUNKS);
  let next = 0;
  let aborted = false;
  async function pump() {
    while (!aborted && next < CHUNKS) {
      const chunk = next++;
      try {
        results[chunk] = await runChunk(chunk);
      } catch (error) {
        if (aborted) throw error;
        echo`${ red('chunk crashed') } ${ cyan(String(error?.message ?? error)) } - retrying once in a fresh process`;
        try {
          results[chunk] = await runChunk(chunk);
        } catch (retryError) {
          aborted = true;
          throw retryError;
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, CHUNKS) }, pump));
  return results;
}

// on the FIRST terminal failure Promise.all rejects while sibling chunks keep running - each is a
// live process that also forked its own stripped worker, so an un-torn-down sibling orphans both.
// kill any chunk still alive (guarded so the success path, where all have already exited, is a
// no-op); the IPC disconnect on kill lets each chunk's own exit handler tear its worker down
// (see harness.mjs)
function killSurvivingChunks() {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
}

let results;
try {
  results = await runAllChunks();
} finally {
  killSurvivingChunks();
}
let passed = 0;
let globalChecked = 0;
let globalArmed = 0;
const failures = [];
const timings = {};
const cache = { hits: 0, evaluated: 0, audited: 0, volatile: 0, drifted: 0 };
for (const r of results) {
  passed += r.passed;
  globalChecked += r.globalChecked;
  globalArmed += r.globalArmed;
  failures.push(...r.failures);
  for (const [phase, ms] of Object.entries(r.timings ?? {})) timings[phase] = (timings[phase] ?? 0) + ms;
  for (const [name, value] of Object.entries(r.cacheStats ?? {})) cache[name] += value;
}
for (const f of failures) echo`${ red('FAIL') } ${ cyan(f) }`;

const globalSummary = PURE_ONLY
  ? red('SKIPPED (pure-only run - NOT a full verification)')
  : `${ cyan(globalArmed) } armed of ${ cyan(globalChecked) } checked`;
const emitterSummary = EMITTER === 'both' ? '' : ` | ${ red(`${ EMITTER }-only, parity oracle OFF`) }`;
const legSummary = `Global leg: ${ globalSummary }${ emitterSummary }`;
echo`\nChunks: ${ CHUNKS } | Passed: ${ green(passed) }, Failed: ${ failures.length ? red(failures.length) : green(0) } | ${ legSummary }`;
// what the run actually EXECUTED, spelled out: a fully memoized run evaluates nothing, and the
// audit count is the only evidence that the cached keys were checked against live ones at all
const volatileNote = cache.volatile ? `, ${ cyan(cache.volatile) } not cacheable (result not a function of the code alone)` : '';
const driftNote = cache.drifted ? `, ${ cyan(cache.drifted) } drifted (stale realm - replayed live and rewritten)` : '';
echo`Cache: ${ cyan(cache.hits) } hits, ${ cyan(cache.evaluated) } evaluated, ${ cyan(cache.audited) } audited${ volatileNote }${ driftNote }`;

// phase table: per-phase wall-time SUMMED over parallel shards (a CPU-time share, not the run's
// wall-clock) - the shares, robust to machine noise, are what optimization decisions read.
// `(inside ...)` phases run within another phase and are excluded from the percentage base
const shareBase = Object.entries(timings)
  .filter(([phase]) => !phase.includes('(inside'))
  .reduce((sum, [, ms]) => sum + ms, 0);
if (shareBase) {
  echo(green('Phase profile (summed across shards):'));
  const padWidth = Math.max(...Object.keys(timings).map(phase => phase.length));
  for (const [phase, ms] of Object.entries(timings).sort((a, b) => b[1] - a[1])) {
    const share = phase.includes('(inside') ? 'subset' : `${ (100 * ms / shareBase).toFixed(1) }%`;
    echo`  ${ cyan(phase.padEnd(padWidth)) } ${ cyan(`${ (ms / 1000).toFixed(1) }s`.padStart(8)) }  ${ share }`;
  }
}

// persist the run's evaluations - failures do not invalidate them: a cell records what the code
// DID, which is what the next run compares against, not whether the comparison passed. a scoped run
// merges cell-wise, so the emitter or leg it skipped keeps its cells instead of losing them.
// fail-open: cache trouble must never fail the run
try {
  await writeCache({
    round: nextRound(stored),
    runtime,
    cases: mergeCases({
      existing: liveCases,
      sets: results.map(r => r.cases ?? {}),
      names: corpusNames,
      evicted: results.flatMap(r => r.evicted ?? []),
      reset: INVALIDATE,
    }),
  });
  // hash-named caches of dead machinery accumulate - sweep them on every run, not only on a storing
  // one: stable machinery would otherwise never sweep at all
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const file of await glob('*.json', { cwd: CACHE_DIR, absolute: true })) {
    if (file.endsWith(CACHE_NAME)) continue;
    if ((await fs.stat(file)).mtimeMs < cutoff) await remove(file);
  }
} catch { /* cache trouble must not shadow the verdict above */ }
// the self-teaching line goes LAST - consumers read run TAILS (a `| tail -N` pipe cuts a top
// banner off), and an agent that paid for one full run learns the cheap edit-loop modes here
if (!tokens.size) echo`edit-loop scoping: ${ cyan('pure') } skips the usage-global leg, ${ cyan('babel') } / ${ cyan('unplugin') } runs one emitter - combinable positional tokens; the bare run stays the gate`;
// a clean run leaves nothing behind; a failed one keeps its modules for reproduction (the tree
// is reaped as dead by the next run's startup sweep)
if (!failures.length) await remove(TMP);
if (failures.length) throw new Error('Some tests have failed');
