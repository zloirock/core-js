import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A `?.` on the NEXT step reads the guard's own value, so the narrow stays at member level.
export function midChain(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Map : realm?.Map)?.groupBy;
}