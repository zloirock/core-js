// One differential shard: runs the subset of generated snippets where (index % total === shard) in its OWN
// process/realm, SEQUENTIALLY - identical to a single run, isolation from the process boundary. See
// index.mjs for why process-sharding (global-mutation isolation) is the only safe parallelism.
// DIFF_SHARD="k/N" selects the shard; the coordinator (index.mjs) forks N and aggregates.
// FIRST, so the ambient globals are installed before any module below runs: the coordinator forks
// this file with a bare `node` (execArgv is deliberately empty so a loader flag is not inherited),
// which leaves the whole shard-side branch - harness, global-leg, the cache store - outside the zx
// context the rest of tests/ is written in. The workers are pointedly NOT in this branch: they are
// spawned per evaluation and run under the builtin strip, where this import would cost both dearly.
import 'zx/globals';
import { auditDrifted, beginCase, cacheStats, collectCases, collectEvicted, discardCase, hashCode, mixedCase } from './cache-store.mjs';
import { generate } from './generate.mjs';
import { checkGlobalSnippet } from './global-leg.mjs';
import { checkSnippet, closeStrippedWorker, phaseNs, summarizeVerdict } from './harness.mjs';

const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
// same oldest target: every manifest feature is then required, so a missing injection is a
// detection miss, never target filtering
const GLOBAL_OPTIONS = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
const [shard, total] = (process.env.DIFF_SHARD ?? '0/1').split('/').map(Number);
// pure-only edit-loop mode: the coordinator already labels the run as not-a-full-verification
const PURE_ONLY = process.env.DIFF_LEGS === 'pure';

// materialized once: the exact subset size feeds the live progress stream (stderr, so the
// coordinator's stdout JSON channel stays clean)
const t0 = process.hrtime.bigint();
const subset = [...generate()].filter((snippet, index) => index % total === shard);
phaseNs['generate corpus'] = process.hrtime.bigint() - t0;
const PROGRESS_EVERY = 100;
let processed = 0;
let passed = 0;
let globalChecked = 0;
let globalArmed = 0;
let astChecked = 0;
const failures = [];
// run both oracles over one snippet. `live` opens its cache group with every cell forced to run
async function judge(snippet, live) {
  await beginCase({ name: snippet.name, code: snippet.code, ts: snippet.ts, live, prefix });
  const verdict = await checkSnippet(snippet.code, OPTIONS, snippet.ts, snippet.strip, snippet.textLags === true);
  const { failed, detail } = summarizeVerdict(verdict);
  const lines = failed ? [`${ snippet.name } :: ${ detail }`] : [];
  // the usage-global leg: skipped for by-design full-env shapes (their stripped divergence is
  // the family's point) and when there is no usable native reference (transform crash)
  const checked = !PURE_ONLY && !snippet.fullEnv && !verdict.transformCrash;
  let armed = false;
  if (checked) {
    const started = process.hrtime.bigint();
    const globalVerdict = await checkGlobalSnippet({
      code: snippet.code,
      ts: snippet.ts,
      native: verdict.native,
      options: GLOBAL_OPTIONS,
      provenArmed: snippet.strip === true,
    });
    armed = globalVerdict.armed;
    if (globalVerdict.failed) lines.push(`${ snippet.name } :: [global] ${ globalVerdict.detail }`);
    phaseNs['global leg'] = (phaseNs['global leg'] ?? 0n) + (process.hrtime.bigint() - started);
  }
  return { lines, armed, checked, ast: verdict.astChecked === true };
}
// running hash of every snippet that already ran in THIS chunk - see beginCase for why a cell is
// addressed by it. folded before the snippet runs, so it describes the realm the snippet meets
let prefix = '';
for (const snippet of subset) {
  // a harness-level throw (e.g. the TS-strip of a plugin output failing, outside checkSnippet's own
  // transform/eval guards) must NOT crash the shard - that discards every divergence accumulated so
  // far and the coordinator sees only "produced no result". record it as a failure and keep going
  try {
    let result = await judge(snippet, false);
    // a divergence found on a MIXED group compared a cached value against a freshly produced one,
    // i.e. two different states of the realm - and a REPRODUCIBLE audit disagreement is the same
    // comparison caught red-handed (the stored value describes a realm a plugin edit moved).
    // Re-play the whole group live before believing anything: shapes whose result is not a function
    // of their code alone diverge here for no product reason, a real product divergence survives
    // the replay and fails on live values, and the replay costs a failing snippet's worker spawns
    if ((result.lines.length && mixedCase()) || auditDrifted()) result = await judge(snippet, true);
    if (result.lines.length) {
      failures.push(...result.lines);
      discardCase(snippet.name);
    } else passed++;
    if (result.checked) globalChecked++;
    if (result.armed) globalArmed++;
    if (result.ast) astChecked++;
  } catch (error) {
    failures.push(`${ snippet.name } :: HARNESS CRASH ${ error?.message ?? error }`);
    discardCase(snippet.name);
  }
  prefix = hashCode(`${ prefix }\u0000${ snippet.code }`, snippet.ts);
  if (++processed % PROGRESS_EVERY === 0 || processed === subset.length) {
    process.stderr.write(`[differential ${ shard + 1 }/${ total }] ${ processed }/${ subset.length }`
      + ` | pure ${ passed } ok | ast-leg ${ astChecked } | global-leg ${ globalArmed } armed`
      + `${ failures.length ? ` | FAILURES ${ failures.length }` : '' }\n`);
  }
}

closeStrippedWorker();
// the coordinator reads this single JSON line from stdout. FLUSH before exiting: the write
// callback fires once the payload is handed to the OS pipe buffer, which survives the
// writer's death and still reaches the coordinator
const timings = Object.fromEntries(Object.entries(phaseNs).map(([phase, ns]) => [phase, Number(ns / 1000000n)]));
const cases = collectCases();
const evicted = collectEvicted();
await new Promise(resolve => {
  process.stdout.write(`\n@@SHARD@@${ JSON.stringify({ passed, failures, globalChecked, globalArmed, astChecked, timings, cases, evicted, cacheStats }) }@@\n`, resolve);
});
// HARD exit. natural teardown after thousands of per-eval worker threads (the usage-global
// leg spawns one per evaluation) ACCESS_VIOLATIONs on Windows (exit code 0xC0000005 fired
// AFTER the last snippet completed, losing the marker with the process). at this point the
// result is flushed and the stripped-worker child is killed above; the worker-thread
// remnants gain nothing from a graceful V8 teardown - skipping it removes the crash window
// eslint-disable-next-line node/no-process-exit -- deliberate: the result is already flushed, graceful teardown is the crash
process.exit(0);
