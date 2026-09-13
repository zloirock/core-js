import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// A live optional arm can store undefined and the following plain read still throws.
// Keep that value and store while providing Map when the selection yields the realm.
export function read(flag) {
  var _ref;
  let held;
  return _ref = flag ? held = null == _globalThis.window ? void 0 : _self : _globalThis, _ref === _self ? _Map : _ref.Map;
}