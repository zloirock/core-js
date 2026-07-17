// Transpiler-differential coordinator: a differential parity check over GENERATED inputs. Each snippet
// passes when babel-plugin and unplugin agree on the injected import-set AND on runtime behaviour
// (native == babel == unplugin), neither plugin throws, and (for grammar snippets) the polyfilled
// output reproduces native in a builtin-absent realm. Body-shape (AST codegen vs text rewrite) is
// NOT compared - that divergence is the architectural sidecar, not a bug.
//
// Parallelism is by PROCESS SHARDING, not in-process concurrency: the corpus mutates globals
// (`Array.of = patched`, `globalThis.Map = shim`), so a shared realm would let concurrent runs
// interleave (a promise-pool produced false fails). Each shard (shard.mjs) runs its subset
// sequentially in its own process/realm - same correctness as a single run, isolation from the
// process boundary. The fixed startup per shard (load @babel/core + @core-js + a stripped worker)
// makes the win modest on a small corpus but it approaches N-fold as the corpus grows - the point.
// Shard count defaults to ~cores/2 (each shard also forks ONE stripped worker, so cores/2 shards
// keep total processes near core count); override with DIFF_SHARDS.
import { fork } from 'node:child_process';
import { mkdir, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { cyan, green, red } = chalk;
const HERE = dirname(fileURLToPath(import.meta.url));
const TMP_ROOT = join(HERE, 'tmp');
// this run's own subdirectory: concurrent runs must never share a tree - the old whole-root
// clear raced a concurrent run's live writers (rm walks the dir, a writer adds a file, the
// final rmdir hits ENOTEMPTY) and swept its modules mid-import
const TMP = join(TMP_ROOT, `run-${ process.pid }`);
const SHARDS = Number(process.env.DIFF_SHARDS) || Math.max(1, Math.floor(os.cpus().length / 2));

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

echo`Transpiler differential: ${ cyan(SHARDS) } shards, three oracles per snippet (full-env three-way + pure stripped worker + usage-global stripped realm); shard progress streams below every 250 snippets`;

const MARKER = /@@SHARD@@(?<json>.*)@@/u;
const children = [];
function runShard(shard) {
  return new Promise((resolve, reject) => {
    // execArgv: [] so the shard (a file module) does not inherit a loader / --input-type flag
    const child = fork(join(HERE, 'shard.mjs'), [], {
      execArgv: [],
      env: { ...process.env, DIFF_SHARD: `${ shard }/${ SHARDS }`, DIFF_TMP: TMP },
      stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
    });
    children.push(child);
    let buf = '';
    child.stdout.on('data', d => { buf += d; });
    child.on('error', reject);
    child.on('exit', () => {
      const found = MARKER.exec(buf);
      if (!found) return reject(new Error(`shard ${ shard } produced no result`));
      resolve(JSON.parse(found.groups.json));
    });
  });
}

// on the FIRST shard failure Promise.all rejects while the siblings keep running - each is a live
// process that also forked its own stripped worker, so an un-torn-down sibling orphans both. kill any
// shard still alive (guarded so the success path, where all have already exited, is a no-op); the
// IPC disconnect on kill lets each shard's own exit handler tear its worker down (see harness.mjs)
function killSurvivingShards() {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
}

let results;
try {
  results = await Promise.all(Array.from({ length: SHARDS }, (_, k) => runShard(k)));
} finally {
  killSurvivingShards();
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

echo`\nShards: ${ SHARDS } | Passed: ${ green(passed) }, Failed: ${ failures.length ? red(failures.length) : green(0) } | Global leg: ${ cyan(globalArmed) } armed of ${ cyan(globalChecked) } checked`;
// a clean run leaves nothing behind; a failed one keeps its modules for reproduction (the tree
// is reaped as dead by the next run's startup sweep)
if (!failures.length) await rm(TMP, { recursive: true, force: true });
if (failures.length) throw new Error('Some tests have failed');
