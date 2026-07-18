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
// runs at most CONCURRENCY of them at once (default ~cores/2: each chunk also forks ONE stripped
// worker, so cores/2 keeps total processes near core count; override with DIFF_SHARDS). The
// chunk count is driven by the per-process snippet cap below, never by the core count alone,
// so a low-core runner still gets bounded process lifetimes. A chunk that dies without a result
// is retried once in a fresh process (see the pool) - the Windows worker-teardown race is
// probabilistic, a deterministic crash still fails on its second death.
import { fork } from 'node:child_process';
import { mkdir, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './generate.mjs';

const { cyan, green, red } = chalk;
const HERE = dirname(fileURLToPath(import.meta.url));
const TMP_ROOT = join(HERE, 'tmp');
// this run's own subdirectory: concurrent runs must never share a tree - the old whole-root
// clear raced a concurrent run's live writers (rm walks the dir, a writer adds a file, the
// final rmdir hits ENOTEMPTY) and swept its modules mid-import
const TMP = join(TMP_ROOT, `run-${ process.pid }`);
const CONCURRENCY = Number(process.env.DIFF_SHARDS) || Math.max(1, Math.floor(os.cpus().length / 2));
// hard cap on snippets per chunk PROCESS, independent of the concurrency above: every full-env
// evaluation dynamic-imports fresh temp modules into the shard (and its stripped worker), and an
// ESM module cache only dies with its process - a low-core runner packing the whole corpus into
// one long-lived shard grows past the CI memory limit and is OOM-killed mid-run ("produced no
// result", no stack). chunking bounds the cache to a size proven fine on every machine; chunks
// beyond the concurrency just queue behind the pool
const SHARD_CAP = Number(process.env.DIFF_SHARD_CAP) || 900;

// each eval writes a fresh temp module (dynamic-import never reuses a URL), so trees grow
// unbounded across runs. reap ONLY dead runs' trees (a killed run never cleans after itself)
// plus legacy shared-root files; a live pid keeps its tree untouched
await mkdir(TMP_ROOT, { recursive: true });
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
  if (dead) await rm(join(TMP_ROOT, entry), { recursive: true, force: true });
}
await mkdir(TMP, { recursive: true });

// corpus size drives the chunk count; generation is cheap string building (no transforms)
const corpusTotal = [...generate()].length;
const CHUNKS = Math.max(CONCURRENCY, Math.ceil(corpusTotal / SHARD_CAP));

echo`Transpiler differential: ${ cyan(corpusTotal) } snippets in ${ cyan(CHUNKS) } chunks (${ cyan(CONCURRENCY) } concurrent), three oracles per snippet (full-env three-way + pure stripped worker + usage-global stripped realm); progress streams below every 250 snippets`;

const MARKER = /@@SHARD@@(?<json>.*)@@/u;
const children = [];
function runChunk(chunk) {
  return new Promise((resolve, reject) => {
    // execArgv: [] so the shard (a file module) does not inherit a loader / --input-type flag
    const child = fork(join(HERE, 'shard.mjs'), [], {
      execArgv: [],
      env: { ...process.env, DIFF_SHARD: `${ chunk }/${ CHUNKS }`, DIFF_TMP: TMP },
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
for (const r of results) {
  passed += r.passed;
  globalChecked += r.globalChecked;
  globalArmed += r.globalArmed;
  failures.push(...r.failures);
}
for (const f of failures) echo`${ red('FAIL') } ${ cyan(f) }`;

echo`\nChunks: ${ CHUNKS } | Passed: ${ green(passed) }, Failed: ${ failures.length ? red(failures.length) : green(0) } | Global leg: ${ cyan(globalArmed) } armed of ${ cyan(globalChecked) } checked`;
// a clean run leaves nothing behind; a failed one keeps its modules for reproduction (the tree
// is reaped as dead by the next run's startup sweep)
if (!failures.length) await rm(TMP, { recursive: true, force: true });
if (failures.length) throw new Error('Some tests have failed');
