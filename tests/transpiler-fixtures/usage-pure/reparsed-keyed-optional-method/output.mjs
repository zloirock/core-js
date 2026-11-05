import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// The first receiver read supplies the method's type again after print and reparse.
function get(value) {
  observe();
  return value;
}
export const array = null == (_ref = (_ref2 = get([7]), key(), _atMaybeArray(_ref2))) ? void 0 : _toFixedMaybeNumber(_ref3 = _ref.call(_ref2, 0)).call(_ref3, 1);
export const own = null == (_ref4 = (_ref5 = get({
  at: null
}))[key(), 'at']) ? void 0 : _toFixedMaybeNumber(_ref6 = _ref4.call(_ref5, arg())).call(_ref6, 1);