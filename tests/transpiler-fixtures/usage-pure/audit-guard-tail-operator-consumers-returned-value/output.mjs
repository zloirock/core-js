import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
function returned() {
  var _ref;
  return null == _globalThis.window ? void 0 : _keysMaybeArray(_ref = _Array$of(2)).call(_ref);
}
export const returnedValue = returned().next().value;