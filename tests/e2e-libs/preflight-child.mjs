// The program `preflight.mjs` forks, one per bundle: UMD on stdin, the checks its `run()` reported on
// stdout. RUNS UNDER A BARE `node`, so nothing it imports may touch a zx global at module scope.
import { runInThisContext } from 'node:vm';
import { jsonLossyAsText } from './diagnostics.mjs';

// buffers, not strings: a multi-byte character split across chunks decodes twice, and these bundles
// carry entity tables
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const code = Buffer.concat(chunks).toString('utf8');
if (!code.trim()) throw new Error('pre-flight child got an empty bundle on stdin');

// with no `module`/`exports` in scope the UMD header takes its global branch and assigns `E2E`
runInThisContext(code, { filename: 'e2e-libs bundle' });

const { run } = globalThis.E2E ?? {};
if (typeof run !== 'function') throw new Error('the bundle exposed no `E2E.run` - its UMD header did not run');

// no handler on the throw: node prints it to stderr and exits non-zero, which `errorReason` reads
const result = await run();
process.stdout.write(JSON.stringify(result.checks, jsonLossyAsText));
