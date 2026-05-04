import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body wraps the receiver decision in a WhileStatement. loop body may early-return
// Map; tail returns Set. `singleReturnBodyExpression` must bail on WhileStatement so the
// outer IIFE call stays raw. inner Map / Set constructors still polyfill independently
const out = (() => {
  while (cond) {
    return _Map;
  }
  return _Set;
})().of(2);
export { out };