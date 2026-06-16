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
  const { failed, detail } = summarizeVerdict(await checkSnippet(snippet.code, OPTIONS, snippet.ts, snippet.strip));
  if (failed) failures.push(`${ snippet.name } :: ${ detail }`);
  else passed++;
}

closeStrippedWorker();
// the coordinator reads this single JSON line from stdout
process.stdout.write(`\n@@SHARD@@${ JSON.stringify({ passed, failures }) }@@\n`);
