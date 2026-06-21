import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body contains an IfStatement before the trailing return. conditional branch
// returns Map, tail returns Set - receiver depends on `cond`, so a scan that only saw
// the tail would resolve wrong. any non-Expression / non-Return statement bails: outer
// call stays raw, inner Map / Set still polyfill. distinct methods per line show the bail
const tailFrom = (() => {
  if (cond) return _Map;
  return _Set;
})().from([1]);
const tailIntersect = (() => {
  if (cond) return _Map;
  return _Set;
})().prototype.intersection;
export { tailFrom, tailIntersect };