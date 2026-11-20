// Compare usage-global imports and execute each rewritten body in a builtin-absent realm.
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
import { runInWorker } from './realm-runner.mjs';
import { cached } from './cache-store.mjs';
import { EMITTER, WANT_BABEL, WANT_UNPLUGIN, armingEval, importSet, setEqual, transformBoth, writeModule } from './harness.mjs';

// one stripped-realm evaluation, memoized by (snippet, type) in the shared cache: the worker spawn
// is what this leg costs, and it only has to happen when the code that would run in it changed
function runOutput({ type, code, ts, sourceType }) {
  return cached({ type, code, evaluate: async () => runInWorker(await writeModule(code, ts, sourceType), { sourceType }) });
}

// Even a source that needs no polyfill can have its body rewritten (for example, a split
// assignment). Keep empirical arming as its own coverage count while checking that output.
export async function checkGlobalOutputs({ code, ts, sourceType, native, rawStripped, babelOut, unpluginOut }) {
  const skip = native.startsWith('ERR|') ? 'native-throw' : rawStripped === native ? 'not-armed' : null;
  if (EMITTER === 'both' && babelOut !== unpluginOut) {
    const babelImports = importSet(babelOut);
    const unpluginImports = importSet(unpluginOut);
    if (!setEqual(babelImports, unpluginImports)) {
      return { skip, failed: true, detail: `imports babel={ ${ [...babelImports].join(', ') } } unplugin={ ${ [...unpluginImports].join(', ') } }` };
    }
  }
  if (skip === 'native-throw') return { skip, failed: false, detail: '' };
  if (rawStripped.startsWith('WORKER-CRASH|')) return { skip: 'harness-crash', failed: true, detail: rawStripped };
  function key(type, output) {
    if (output === undefined) return null;
    return output === code ? rawStripped : runOutput({ type, code: output, ts, sourceType });
  }
  const babel = key('global-babel', babelOut);
  const [babelKey, unpluginKey] = await Promise.all([
    babel, babelOut === unpluginOut ? babel : key('global-unplugin', unpluginOut),
  ]);
  const failed = (WANT_BABEL && babelKey !== native) || (WANT_UNPLUGIN && unpluginKey !== native);
  return { skip, failed, detail: failed ? `stripped-realm native=${ native } babel=${ babelKey } unplugin=${ unpluginKey }` : '' };
}

export async function checkGlobalSnippet({ code, ts = false, native, options, strippedNative = null, sourceType = 'module' }) {
  const [{ babelOut, unpluginOut, babelError, unpluginError }, rawStripped] = await Promise.all([
    transformBoth({ src: code, options, ts, sourceType }),
    native.startsWith('ERR|') ? null : strippedNative ?? armingEval(code, ts, sourceType),
  ]);
  if (babelError || unpluginError) {
    const details = [];
    if (babelError) details.push(`babel threw: ${ babelError }`);
    if (unpluginError) details.push(`unplugin threw: ${ unpluginError }`);
    return { skip: 'transform-crash', failed: true, detail: details.join('; ') };
  }
  return checkGlobalOutputs({ code, ts, sourceType, native, rawStripped, babelOut, unpluginOut });
}
