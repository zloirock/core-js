// The usage-global stripped-realm leg. usage-global rewrites NOTHING - it only prepends
// `core-js/modules/*` imports - so every pure-leg oracle is blind to it: the full-env runtime is
// identical whether an injection landed or not, and import parity passes when BOTH plugins miss
// identically. The one observable that catches a shared miss is behaviour in a realm WITHOUT the
// modern builtins: the injected modules must reinstall them there, so a missed injection leaves
// the gap in place and the body throws / diverges from the full-env native reference.
//
// Isolation is a fresh worker thread per evaluation (global-leg-worker.mjs): the injected global
// polyfills install onto the worker's globals and die with it. A shared realm would be vacuous
// after the first correct install - the installed global masks every later snippet's miss.
// (ShadowRealm is cheaper per run but realms are never reclaimed, so a full-corpus shard
// OOMs - workers release their memory on exit.)
//
// ARMING is empirical, not flag-derived: a snippet is armed iff its UNTRANSFORMED source diverges
// in the stripped realm - i.e. it provably depends on a stripped builtin. The expectation comes
// from the input, never from the output under test (a missed injection cannot un-arm itself), and
// it arms the `strip:false` hosts (param-default / assignment) the pure leg must skip: under
// usage-global's inject-if-might contract those have no "legitimately did not inject" escape.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { EMITTER, WANT_BABEL, WANT_UNPLUGIN, importSet, phaseNs, setEqual, transformBoth, writeModule } from './harness.mjs';

const WORKER = join(dirname(fileURLToPath(import.meta.url)), 'global-leg-worker.mjs');

// run an already-written module file in a fresh stripped worker realm; resolves to its runtimeKey.
// a worker-level crash (strip canary, loader failure) or a silent exit resolves to a sentinel that
// can never equal a native reference, so it surfaces as a loud failure instead of a skip
function runStripped(file) {
  return new Promise(resolve => {
    // the accessor pre-warm touches the lazy localStorage getter, which emits an
    // ExperimentalWarning per fresh worker - thousands of them per run without the disable
    const worker = new Worker(WORKER, { workerData: { file }, execArgv: ['--disable-warning=ExperimentalWarning'] });
    let result = null;
    function record(key) {
      result ??= key;
    }
    worker.once('message', key => {
      record(key);
      // grace window: a snippet that left a live handle (a timer, an open port) keeps the
      // thread alive past its natural wind-down - fall back to forcible teardown then.
      // unref'd so the guard itself never holds the shard open; firing after a clean exit
      // terminates an already-dead worker (a settled no-op)
      const guard = setTimeout(() => {
        // eslint-disable-next-line promise/prefer-await-to-then, no-empty-function -- fire-and-forget fallback teardown
        worker.terminate().catch(() => {});
      }, 2000);
      guard.unref();
    });
    worker.once('error', error => {
      record(`WORKER-CRASH|${ error?.message ?? error }`);
      // an errored worker may never end on its own - forcible teardown only on this path
      // eslint-disable-next-line promise/prefer-await-to-then, promise/no-promise-in-callback, no-empty-function -- fire-and-forget teardown of a dead worker
      worker.terminate().catch(() => {});
    });
    // resolve on EXIT, not on message: the worker closes its own port after posting and the
    // thread ends NATURALLY - no `terminate()` on the happy path, and no overlap between one
    // worker's teardown and the next one's spawn (both belong to the forcible-disposal race
    // class behind the Windows ACCESS_VIOLATION crashes at this spawn volume)
    worker.once('exit', () => resolve(result ?? 'WORKER-CRASH|exited without result'));
  });
}

async function runOutput(code, ts) {
  const file = await writeModule(code, ts);
  return runStripped(file);
}

// --- arming cache ---
// arming is a property of the INPUT - the raw source's stripped-realm key - independent of the
// plugins under test and deterministic over the deterministic corpus, so it is cached across
// runs. the coordinator validates the cache against the strip-machinery hash and passes its
// path; a hit skips the worker spawn, while the comparison against this run's native reference
// stays live. new keys are reported through the shard marker and merged by the coordinator
const newArmings = {};
let armingCache = null;
// caches the load PROMISE, not the object: a value-cached variant hands the pre-read empty
// object to any caller arriving while the first read is still in flight
function loadedArmingCache() {
  return armingCache ??= (async () => {
    const file = process.env.DIFF_ARMING_CACHE;
    if (!file) return {};
    try {
      return JSON.parse(await readFile(file, 'utf8')).entries ?? {};
    } catch {
      // absent or torn cache - every arming just evaluates
      return {};
    }
  })();
}
export function collectNewArmings() {
  return newArmings;
}
function snippetHash(code, ts) {
  // the fixed-width flag goes FIRST, so the variable-length code needs no delimiter after it
  return createHash('sha256').update(ts ? '1' : '0').update(code).digest('hex').slice(0, 16);
}
// never rejects: the promise floats unhandled while the transforms run, so a rejection here
// (a temp-file write failure, say) would bypass the shard's per-snippet catch and kill the shard
async function armingEval(code, ts) {
  const cache = await loadedArmingCache();
  const hash = snippetHash(code, ts);
  if (hash in cache) return cache[hash];
  const t0 = process.hrtime.bigint();
  let key;
  try {
    key = await runOutput(code, ts);
  } catch (error) {
    key = `WORKER-CRASH|arming: ${ error?.message ?? error }`;
  }
  phaseNs['arming eval (inside global leg)'] = (phaseNs['arming eval (inside global leg)'] ?? 0n) + (process.hrtime.bigint() - t0);
  // a crash sentinel is a transient, not the snippet's key - cached, it would pin the snippet
  // armed forever instead of being re-probed on the next run
  if (!key.startsWith('WORKER-CRASH|')) newArmings[hash] = key;
  return key;
}

// the output minus the injected core-js import lines - equal to the source iff the emitter
// only prepended imports and left the body bytes alone
const INJECTED_IMPORT_LINE = /^\s*(?:import\s+["']@?core-js|(?:const|var)\s+\w+\s*=\s*require\(["']@?core-js)/u;
function residualBody(code) {
  return code.split('\n').filter(line => !INJECTED_IMPORT_LINE.test(line)).join('\n').trim();
}

// the usage-global verdict for one snippet. `native` is the full-env reference key the pure leg
// already computed; a throwing native is vacuous-by-throw (ERR == ERR regardless of injection),
// same gate as the pure stripped leg. returns { armed, failed, detail }
export async function checkGlobalSnippet({ code, ts = false, native, options, provenArmed = false }) {
  if (native.startsWith('ERR')) return { armed: false, failed: false, detail: '' };
  // arming: a `strip:true` snippet is the generator's PROVEN manifest-builtin read - its
  // stripped-realm divergence holds by construction (this realm strips the same globals as
  // the pure regex's token set) and the evaluation is skipped; the output-vs-native oracle
  // still runs and can only fail loudly. everything else is judged EMPIRICALLY: the corpus
  // builds keys at runtime (`'fr' + 'om'` folds, buried template concats), so no static token
  // test is sound and a prefilter would silently blind such snippets.
  // the arming evaluation only needs the ORIGINAL source - start it and run both transforms
  // while the worker spins, hiding its latency behind CPU work the shard must do anyway
  const armingKey = provenArmed ? null : armingEval(code, ts);

  const { babelOut, unpluginOut, babelError, unpluginError } = await transformBoth({ src: code, options, ts });
  // a throwing transform fails BEFORE the arming gate: a crash is a plugin bug on any input,
  // and an unarmed verdict here would swallow it for exactly the snippets nothing else runs
  if (babelError || unpluginError) {
    const details = [];
    if (babelError) details.push(`babel threw: ${ babelError }`);
    if (unpluginError) details.push(`unplugin threw: ${ unpluginError }`);
    return { armed: true, failed: true, detail: details.join('; ') };
  }
  if (armingKey && await armingKey === native) return { armed: false, failed: false, detail: '' };

  // collapse two evaluations into ONE when the outputs are semantically the same module: equal
  // injected import sets AND an untouched unplugin body. byte-equality almost never fires here
  // (babel is an AST reprint, unplugin a text insertion), while the semantic pair holds on
  // nearly the whole corpus. the residual guard keeps a corrupted unplugin insertion - its
  // usage-global output runs nowhere else - out of the collapse: any body change forces both
  // evaluations. the collapsed run evaluates the UNPLUGIN output (its body is the literal source
  // bytes); babel's reprint fidelity is @babel/generator's contract, not this leg's
  let babelKey;
  let unpluginKey;
  const sameImports = EMITTER === 'both' && setEqual(importSet(babelOut), importSet(unpluginOut));
  if (sameImports && (babelOut === unpluginOut || residualBody(unpluginOut) === code.trim())) {
    babelKey = unpluginKey = await runOutput(unpluginOut, ts);
  } else {
    [babelKey, unpluginKey] = await Promise.all([
      WANT_BABEL ? runOutput(babelOut, ts) : null,
      WANT_UNPLUGIN ? runOutput(unpluginOut, ts) : null,
    ]);
  }
  if ((!WANT_BABEL || babelKey === native) && (!WANT_UNPLUGIN || unpluginKey === native)) {
    return { armed: true, failed: false, detail: '' };
  }
  // import sets ride along as the localization signal: a shared miss (both diverge, sets agree)
  // roots in the provider's detection, a one-sided one in that emitter
  const imports = `imports babel={ ${ WANT_BABEL ? [...importSet(babelOut)].join(', ') : '-' } }`
    + ` unplugin={ ${ WANT_UNPLUGIN ? [...importSet(unpluginOut)].join(', ') : '-' } }`;
  return {
    armed: true,
    failed: true,
    detail: `stripped-realm native=${ native } babel=${ babelKey } unplugin=${ unpluginKey }; ${ imports }`,
  };
}
