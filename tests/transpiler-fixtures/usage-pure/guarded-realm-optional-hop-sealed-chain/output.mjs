import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A SEAL makes the source read the short-circuited value: the native throw is kept.
export function sealedChain(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Map : realm?.Map).groupBy;
}