import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The hop the chain ENDS on short-circuits inside the raw branch itself and keeps the guard.
export function lastHop(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return realm === _globalThis ? _Map : realm?.Map;
}