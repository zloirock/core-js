import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body has a SwitchStatement before the tail return. cases may early-return Map or
// Set; tail returns Array. `singleReturnBodyExpression` must bail on SwitchStatement —
// nested ReturnStatements inside SwitchCase consequent are NOT visible to the top-level
// scan, only the tail. outer call stays raw to preserve runtime branching
const out = (() => {
  switch (kind) {
    case 'a':
      return _Map;
    case 'b':
      return _Set;
  }
  return Array;
})().from([1]);
export { out };