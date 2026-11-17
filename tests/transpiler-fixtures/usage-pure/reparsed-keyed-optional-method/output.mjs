import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3;
// A returned array retains its method type across a computed optional call and reparse.
function get(value) {
  observe();
  return value;
}
export const array = null == (_ref = (_ref2 = get([7]), key(), _atMaybeArray(_ref2))) ? void 0 : _toFixedMaybeNumber(_ref3 = _ref.call(_ref2, 0)).call(_ref3, 1);