import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A MEMOIZED synth-swap receiver (SE-bearing, >=1 unpolyfilled key) takes the same canonical re-read target as the direct path:
// pure-ctor leaf whole-swaps with the erased navigation's effects harvested ahead of the binding; an alias root keeps its
// identifier and only drops the dead hop; a direct root collapses to the proxy import.
const g = _globalThis;
function eff() {
  return null;
}
function aliasNonPureLeaf({
  fromEntries,
  missing
} = function (_ref) {
  return {
    fromEntries: _Object$fromEntries,
    missing: _ref.missing
  };
}((eff(), g.Object))) {
  return [fromEntries, missing];
}
aliasNonPureLeaf();