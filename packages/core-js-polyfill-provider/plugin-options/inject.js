// shared injection helpers + canonical compat-data sort. the sort exports go to both plugins'
// import-injectors and the debug-output formatter so concatenated bundles stay byte-stable; the
// bigger half of the file - `createModuleInjectors` - is consumed by the two plugin ENTRY points,
// which is where an entry / usage hit turns into the modules actually injected
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

// accepts ANY iterable (Set / Map keys / array) and returns a FRESH array - the internal spread is
// load-bearing, not defensive: `sort` mutates in place, so sorting a caller's array would reorder
// the live registry. stating it here removes the reason call sites materialised a copy of their own
// and paid for two copies per sort
export function sortByPolyfillOrder(modules) {
  return [...modules].sort(polyfillOrderComparator);
}

// getDebugOutput returns per-file collector or null when debug is off
export function createModuleInjectors({ mode, getModulesForEntry, getDebugOutput, injectGlobal }) {
  function injectModule(moduleName) {
    injectGlobal(moduleName);
    getDebugOutput()?.add(moduleName);
  }

  // returns the count of modules the entry resolved to (after mode + target filtering) so callers
  // can distinguish a recognized-but-out-of-current-layer entry (0 modules) from one that injected
  function injectModulesForEntry(entry) {
    const mods = getModulesForEntry(entry);
    for (const mod of mods) injectModule(mod);
    return mods.length;
  }

  function injectModulesForModeEntry(entry) {
    return injectModulesForEntry(`${ mode }/${ entry }`);
  }

  function outputDebug() {
    const debugOutput = getDebugOutput();
    // guard `typeof console` for a console-less runtime, matching the sibling opt-in-debug sink in
    // snapshot-cache.js; both fire only under `debug:true`, so an unguarded ReferenceError here would
    // be a hygiene regression in that exotic environment
    if (!debugOutput || typeof console === 'undefined') return;
    // eslint-disable-next-line no-console -- debug output
    console.log(debugOutput.format());
  }

  return { injectModulesForEntry, injectModulesForModeEntry, outputDebug };
}
