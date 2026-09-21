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

// a module the compat data knows, as opposed to an entry path the pure package imports
export function isPolyfillModule(name) {
  return polyfillOrder.has(name);
}

// `getDebugOutput` returns the per-file collector, or null when debug is off; `getEmitted` the
// polyfills the host's injector holds once the file is done - after every dedup and prune - which
// is what the report prints: the emission, not the requests that led to it
export function createModuleInjectors({ mode, getModulesForEntry, getDebugOutput, injectGlobal, getEmitted }) {
  // returns the count of modules the entry resolved to (after mode + target filtering) so callers
  // can distinguish a recognized-but-out-of-current-layer entry (0 modules) from one that injected
  function injectModulesForEntry(entry) {
    const mods = getModulesForEntry(entry);
    for (const mod of mods) injectGlobal(mod);
    return mods.length;
  }

  function injectModulesForModeEntry(entry) {
    return injectModulesForEntry(`${ mode }/${ entry }`);
  }

  // is this entry a PROPOSAL - carried by no standard layer, only by `actual` / `full`? Asked at the
  // fixed layer rather than the configured one, so the answer cannot move as `mode` widens: reading
  // it off the configured layer is what let a wider mode resolve a member and take its receiver's
  // constructor away with it
  function isProposalEntry(entry) {
    return getModulesForEntry(`stable/${ entry }`).length === 0;
  }

  function outputDebug() {
    const debugOutput = getDebugOutput();
    // guard `typeof console` for a console-less runtime, matching the sibling opt-in-debug sink in
    // snapshot-cache.js; both fire only under `debug:true`, so an unguarded ReferenceError here would
    // be a hygiene regression in that exotic environment
    if (!debugOutput || typeof console === 'undefined') return;
    // eslint-disable-next-line no-console -- debug output
    console.log(debugOutput.format(getEmitted()));
  }

  return { injectModulesForEntry, injectModulesForModeEntry, isProposalEntry, outputDebug };
}
