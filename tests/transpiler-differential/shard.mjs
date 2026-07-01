// One differential shard: runs the subset of generated snippets where (index % total === shard) in its OWN
// process/realm, SEQUENTIALLY - identical to a single run, isolation from the process boundary. See
// index.mjs for why process-sharding (global-mutation isolation) is the only safe parallelism.
// DIFF_SHARD="k/N" selects the shard; the coordinator (index.mjs) forks N and aggregates.
import { generate } from './generate.mjs';
import { checkSnippet, closeStrippedWorker, summarizeVerdict } from './harness.mjs';

const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const [shard, total] = (process.env.DIFF_SHARD ?? '0/1').split('/').map(Number);

let index = 0;
let passed = 0;
const failures = [];
for (const snippet of generate()) {
  if (index++ % total !== shard) continue;
  // a harness-level throw (e.g. the TS-strip of a plugin output failing, outside checkSnippet's own
  // transform/eval guards) must NOT crash the shard - that discards every divergence accumulated so
  // far and the coordinator sees only "produced no result". record it as a failure and keep going
  try {
    const { failed, detail } = summarizeVerdict(await checkSnippet(snippet.code, OPTIONS, snippet.ts, snippet.strip));
    if (failed) failures.push(`${ snippet.name } :: ${ detail }`);
    else passed++;
  } catch (error) {
    failures.push(`${ snippet.name } :: HARNESS CRASH ${ error?.message ?? error }`);
  }
}

closeStrippedWorker();
// the coordinator reads this single JSON line from stdout
process.stdout.write(`\n@@SHARD@@${ JSON.stringify({ passed, failures }) }@@\n`);
