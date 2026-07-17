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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { importSet, transformBabel, transformUnplugin, writeModule } from './harness.mjs';

const WORKER = join(dirname(fileURLToPath(import.meta.url)), 'global-leg-worker.mjs');

// run an already-written module file in a fresh stripped worker realm; resolves to its runtimeKey.
// a worker-level crash (strip canary, loader failure) or a silent exit resolves to a sentinel that
// can never equal a native reference, so it surfaces as a loud failure instead of a skip
function runStripped(file) {
  return new Promise(resolve => {
    // the accessor pre-warm touches the lazy localStorage getter, which emits an
    // ExperimentalWarning per fresh worker - thousands of them per run without the disable
    const worker = new Worker(WORKER, { workerData: { file }, execArgv: ['--disable-warning=ExperimentalWarning'] });
    let settled = false;
    function settle(key) {
      if (!settled) resolve(key);
      settled = true;
      worker.terminate();
    }
    worker.once('message', settle);
    worker.once('error', error => settle(`WORKER-CRASH|${ error?.message ?? error }`));
    worker.once('exit', () => settle('WORKER-CRASH|exited without result'));
  });
}

async function runOutput(code, ts) {
  const file = await writeModule(code, ts);
  return runStripped(file);
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
  const armingKey = provenArmed ? null : runOutput(code, ts);

  let babelOut;
  let unpluginOut;
  let babelError = null;
  let unpluginError = null;
  try {
    babelOut = await transformBabel(code, options, ts);
  } catch (error) {
    babelError = error?.message ?? String(error);
  }
  try {
    unpluginOut = transformUnplugin(code, options, ts);
  } catch (error) {
    unpluginError = error?.message ?? String(error);
  }
  if (armingKey && await armingKey === native) return { armed: false, failed: false, detail: '' };
  if (babelError || unpluginError) {
    const details = [];
    if (babelError) details.push(`babel threw: ${ babelError }`);
    if (unpluginError) details.push(`unplugin threw: ${ unpluginError }`);
    return { armed: true, failed: true, detail: details.join('; ') };
  }

  // both emitters usually agree byte-for-byte on usage-global output (imports + untouched
  // body) - identical text is ONE evaluation, not two: same file, same key by construction
  let babelKey;
  let unpluginKey;
  if (babelOut === unpluginOut) {
    babelKey = unpluginKey = await runOutput(babelOut, ts);
  } else {
    [babelKey, unpluginKey] = await Promise.all([runOutput(babelOut, ts), runOutput(unpluginOut, ts)]);
  }
  if (babelKey === native && unpluginKey === native) return { armed: true, failed: false, detail: '' };
  // import sets ride along as the localization signal: a shared miss (both diverge, sets agree)
  // roots in the provider's detection, a one-sided one in that emitter
  const imports = `imports babel={ ${ [...importSet(babelOut)].join(', ') } } unplugin={ ${ [...importSet(unpluginOut)].join(', ') } }`;
  return {
    armed: true,
    failed: true,
    detail: `stripped-realm native=${ native } babel=${ babelKey } unplugin=${ unpluginKey }; ${ imports }`,
  };
}
