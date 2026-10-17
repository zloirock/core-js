import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// An effectful prefix on the receiver runs once, ahead of the whole guard.
export const prefixLog = [];
export function seqPrefix(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return _pushMaybeArray(prefixLog).call(prefixLog, 'r'), null == realm ? void 0 : (realm === _globalThis ? _Map : realm.Map).groupBy;
}