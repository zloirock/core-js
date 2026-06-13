// Transpiler-fuzz coordinator: a differential parity check over GENERATED inputs. Each snippet
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
// keep total processes near core count); override with FUZZ_SHARDS.
import { fork } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { cyan, green, red } = chalk;
const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, 'tmp');
const SHARDS = Number(process.env.FUZZ_SHARDS) || Math.max(1, Math.floor(os.cpus().length / 2));

// each eval writes a fresh temp module (dynamic-import never reuses a URL); without this the dir
// grows unbounded across runs. clear ONCE here, before any shard writes its PID-prefixed files
await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });

const MARKER = /@@SHARD@@(?<json>.*)@@/u;
function runShard(shard) {
  return new Promise((resolve, reject) => {
    // execArgv: [] so the shard (a file module) does not inherit a loader / --input-type flag
    const child = fork(join(HERE, 'shard.mjs'), [], {
      execArgv: [],
      env: { ...process.env, FUZZ_SHARD: `${ shard }/${ SHARDS }` },
      stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
    });
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

const results = await Promise.all(Array.from({ length: SHARDS }, (_, k) => runShard(k)));
let passed = 0;
const failures = [];
for (const r of results) {
  passed += r.passed;
  failures.push(...r.failures);
}
for (const f of failures) echo`${ red('FAIL') } ${ cyan(f) }`;

echo`\nShards: ${ SHARDS } | Passed: ${ green(passed) }, Failed: ${ failures.length ? red(failures.length) : green(0) }`;
if (failures.length) throw new Error('Some tests have failed');
