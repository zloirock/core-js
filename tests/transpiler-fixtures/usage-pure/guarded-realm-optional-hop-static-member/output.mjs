import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
export function staticMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (realm === _globalThis ? _Map : realm.Map).groupBy;
}