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
import { runInWorker } from './realm-runner.mjs';
import { cached } from './cache-store.mjs';
import { EMITTER, WANT_BABEL, WANT_UNPLUGIN, armingEval, importSet, setEqual, transformBoth, writeModule } from './harness.mjs';

// one stripped-realm evaluation, memoized by (snippet, type) in the shared cache: the worker spawn
// is what this leg costs, and it only has to happen when the code that would run in it changed
function runOutput({ type, code, ts, sourceType }) {
  return cached({ type, code, evaluate: async () => runInWorker(await writeModule(code, ts, sourceType), { sourceType }) });
}

// the usage-global verdict for one snippet. `native` is the full-env reference key the pure leg
// already computed; a throwing native is vacuous-by-throw (ERR == ERR regardless of injection),
// same gate as the pure stripped leg. returns { skip, failed, detail } - `skip` names why the
// stripped-realm comparison did not run and is null when it did, which is what the run's coverage
// accounting counts as this leg's ARMED snippets
export async function checkGlobalSnippet({ code, ts = false, native, options, strippedNative = null, sourceType = 'module' }) {
  if (native.startsWith('ERR')) return { skip: 'native-throw', failed: false, detail: '' };
  // The pure leg may already have evaluated the same raw source. A manual strip flag
  // proves nothing; keys assembled at runtime must be armed just like literal reads.
  const armingKey = strippedNative ?? armingEval(code, ts, sourceType);

  const { babelOut, unpluginOut, babelError, unpluginError } = await transformBoth({ src: code, options, ts, sourceType });
  const rawStripped = await armingKey;
  // a throwing transform fails BEFORE the arming gate: a crash is a plugin bug on any input,
  // and an unarmed verdict here would swallow it for exactly the snippets nothing else runs
  if (babelError || unpluginError) {
    const details = [];
    if (babelError) details.push(`babel threw: ${ babelError }`);
    if (unpluginError) details.push(`unplugin threw: ${ unpluginError }`);
    return { skip: 'transform-crash', failed: true, detail: details.join('; ') };
  }
  if (rawStripped.startsWith('WORKER-CRASH|')) return { skip: 'harness-crash', failed: true, detail: rawStripped };
  if (rawStripped === native) return { skip: 'not-armed', failed: false, detail: '' };

  // collapse two evaluations into ONE when the outputs are byte-identical: both emitters are
  // AST reprints now, so agreeing trees usually print the same bytes. any difference - imports
  // or body - forces both evaluations
  let babelKey;
  let unpluginKey;
  const sameImports = EMITTER === 'both' && setEqual(importSet(babelOut), importSet(unpluginOut));
  if (sameImports && babelOut === unpluginOut) {
    // ONE cell, not two: the twin is never read while the collapse holds - only the split branch
    // asks for `global-unplugin` - so recording it would add a copy per armed snippet that nothing
    // consumes. A snippet that later starts splitting pays one worker spawn for the miss
    babelKey = unpluginKey = await runOutput({ type: 'global-babel', code: unpluginOut, ts, sourceType });
  } else {
    [babelKey, unpluginKey] = await Promise.all([
      WANT_BABEL ? runOutput({ type: 'global-babel', code: babelOut, ts, sourceType }) : null,
      WANT_UNPLUGIN ? runOutput({ type: 'global-unplugin', code: unpluginOut, ts, sourceType }) : null,
    ]);
  }
  if ((!WANT_BABEL || babelKey === native) && (!WANT_UNPLUGIN || unpluginKey === native)) {
    return { skip: null, failed: false, detail: '' };
  }
  // import sets ride along as the localization signal: a shared miss (both diverge, sets agree)
  // roots in the provider's detection, a one-sided one in that emitter
  const imports = `imports babel={ ${ WANT_BABEL ? [...importSet(babelOut)].join(', ') : '-' } }`
    + ` unplugin={ ${ WANT_UNPLUGIN ? [...importSet(unpluginOut)].join(', ') : '-' } }`;
  return {
    skip: null,
    failed: true,
    detail: `stripped-realm native=${ native } babel=${ babelKey } unplugin=${ unpluginKey }; ${ imports }`,
  };
}
