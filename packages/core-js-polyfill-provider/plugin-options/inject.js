// module injection helpers shared by both plugins. produces small functions that wrap
// the per-file injectGlobal callback with debug-output bookkeeping. also hosts
// `sortByPolyfillOrder` (imported by both plugins' import-injectors and by debug-output
// to keep emit order deterministic across the stack)
import compatData from '@core-js/compat/data' with { type: 'json' };

const { keys } = Object;

// canonical polyfill ordering based on compat data registry
const polyfillOrder = new Map(keys(compatData).map((k, i) => [k, i]));

// canonical compat-data comparator. unknown names (Infinity order) fall through to
// lexicographic secondary sort so the output order stays deterministic even when the
// registry hasn't been updated with every future proposal - `Infinity - Infinity = NaN`
// otherwise poisoned the comparator and left relative order undefined. exposed as a
// raw comparator so callers that already hold their own array can `.sort` directly
// without round-tripping through `sortByPolyfillOrder`'s array materialisation
export function polyfillOrderComparator(a, b) {
  const oa = polyfillOrder.get(a) ?? Infinity;
  const ob = polyfillOrder.get(b) ?? Infinity;
  if (oa !== ob && Number.isFinite(oa - ob)) return oa - ob;
  return a < b ? -1 : a > b ? 1 : 0;
}

// sort module names by canonical compat data order; thin wrapper over the comparator
export function sortByPolyfillOrder(modules) {
  return [...modules].sort(polyfillOrderComparator);
}

// create injection helper functions shared by both plugins
// getDebugOutput returns the per-file debug collector (or null if debug is off)
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
