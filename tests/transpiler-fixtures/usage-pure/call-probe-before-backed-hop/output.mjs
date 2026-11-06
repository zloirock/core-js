import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A backed realm hop does not prove that the earlier call yielded a defined value.
// Capturing the call keeps the guard on that yield before the static and instance claims.
function read() {
  return _globalThis.window;
}
export const value = String(null == read() ? void 0 : _atMaybeArray(_ref = _Array$of(32)).call(_ref, 0));