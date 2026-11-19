import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The shadowed self parameter belongs to the caller, including its Map property.
// Only a selected realm receives the polyfill; retain the original store.
export function read(self, flag) {
  var _ref;
  let held;
  return _ref = flag ? held = _globalThis : self, _ref === _globalThis ? _Map : _ref.Map;
}