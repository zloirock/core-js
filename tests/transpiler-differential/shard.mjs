// One differential shard: runs the subset of generated snippets where (index % total === shard) in its OWN
// process/realm, SEQUENTIALLY - identical to a single run, isolation from the process boundary. See
// index.mjs for why process-sharding (global-mutation isolation) is the only safe parallelism.
// DIFF_SHARD="k/N" selects the shard; the coordinator (index.mjs) forks N and aggregates.
import { generate } from './generate.mjs';
import { checkGlobalSnippet } from './global-leg.mjs';
import { checkSnippet, closeStrippedWorker, summarizeVerdict } from './harness.mjs';

const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
// same oldest target: every manifest feature is then required, so a missing injection is a
// detection miss, never target filtering
const GLOBAL_OPTIONS = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
const [shard, total] = (process.env.DIFF_SHARD ?? '0/1').split('/').map(Number);

// materialized once: the exact subset size feeds the live progress stream (stderr, so the
// coordinator's stdout JSON channel stays clean)
const subset = [...generate()].filter((snippet, index) => index % total === shard);
const PROGRESS_EVERY = 250;
let processed = 0;
let passed = 0;
let globalChecked = 0;
let globalArmed = 0;
const failures = [];
for (const snippet of subset) {
  // a harness-level throw (e.g. the TS-strip of a plugin output failing, outside checkSnippet's own
  // transform/eval guards) must NOT crash the shard - that discards every divergence accumulated so
  // far and the coordinator sees only "produced no result". record it as a failure and keep going
  try {
    const verdict = await checkSnippet(snippet.code, OPTIONS, snippet.ts, snippet.strip);
    const { failed, detail } = summarizeVerdict(verdict);
    if (failed) failures.push(`${ snippet.name } :: ${ detail }`);
    else passed++;
    // the usage-global leg: skipped for by-design full-env shapes (their stripped divergence is
    // the family's point) and when there is no usable native reference (transform crash)
    if (!snippet.fullEnv && !verdict.transformCrash) {
      globalChecked++;
      const globalVerdict = await checkGlobalSnippet({
        code: snippet.code,
        ts: snippet.ts,
        native: verdict.native,
        options: GLOBAL_OPTIONS,
        provenArmed: snippet.strip === true,
      });
      if (globalVerdict.armed) globalArmed++;
      if (globalVerdict.failed) failures.push(`${ snippet.name } :: [global] ${ globalVerdict.detail }`);
    }
  } catch (error) {
    failures.push(`${ snippet.name } :: HARNESS CRASH ${ error?.message ?? error }`);
  }
  if (++processed % PROGRESS_EVERY === 0 || processed === subset.length) {
    process.stderr.write(`[differential ${ shard + 1 }/${ total }] ${ processed }/${ subset.length }`
      + ` | pure ${ passed } ok | global-leg ${ globalArmed } armed${ failures.length ? ` | FAILURES ${ failures.length }` : '' }\n`);
  }
}

closeStrippedWorker();
// the coordinator reads this single JSON line from stdout
process.stdout.write(`\n@@SHARD@@${ JSON.stringify({ passed, failures, globalChecked, globalArmed }) }@@\n`);
