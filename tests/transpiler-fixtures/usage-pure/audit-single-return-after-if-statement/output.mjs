import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body contains an IfStatement before the trailing return. conditional branch
// returns Map at runtime, tail returns Set - receiver depends on `cond`, so a scan that
// only saw the tail would resolve wrong. `singleReturnBodyExpression` bails on any
// non-Expression / non-Return statement, so the outer IIFE call stays raw and `.from`
// access is not pre-resolved. inner Map / Set constructor references still polyfill
// normally. distinct methods per line make the bail visible
const tailFrom = (() => {
  if (cond) return _Map;
  return _Set;
})().from([1]);
const tailIntersect = (() => {
  if (cond) return _Map;
  return _Set;
})().prototype.intersection;
export { tailFrom, tailIntersect };