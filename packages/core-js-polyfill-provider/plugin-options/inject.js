// shared injection helpers + canonical compat-data sort. exported by both plugins'
// import-injectors and the debug-output formatter so concatenated bundles stay byte-stable
import compatData from '@core-js/compat/data' with { type: 'json' };

const { keys } = Object;

const polyfillOrder = new Map(keys(compatData).map((k, i) => [k, i]));

// strict weak order: known-by-rank, then unknown-by-lex AFTER all known. the known/unknown
// split is what gives transitivity - a single lex fallback would let `aaa.unknown` cross
// the known/unknown boundary inconsistently
export function polyfillOrderComparator(a, b) {
  const oa = polyfillOrder.get(a);
  const ob = polyfillOrder.get(b);
  const aKnown = oa !== undefined;
  const bKnown = ob !== undefined;
  if (aKnown && bKnown) return oa - ob;
  if (aKnown !== bKnown) return aKnown ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sortByPolyfillOrder(modules) {
  return [...modules].sort(polyfillOrderComparator);
}

// getDebugOutput returns per-file collector or null when debug is off
export function createModuleInjectors({ mode, getModulesForEntry, getDebugOutput, injectGlobal }) {
  function injectModule(moduleName) {
    injectGlobal(moduleName);
    getDebugOutput()?.add(moduleName);
  }

  function injectModulesForEntry(entry) {
    for (const mod of getModulesForEntry(entry)) injectModule(mod);
  }

  function injectModulesForModeEntry(entry) {
    injectModulesForEntry(`${ mode }/${ entry }`);
  }

  function outputDebug() {
    const debugOutput = getDebugOutput();
    if (!debugOutput) return;
    // eslint-disable-next-line no-console -- debug output
    console.log(debugOutput.format());
  }

  return { injectModulesForEntry, injectModulesForModeEntry, outputDebug };
}
