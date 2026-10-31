import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an optional CALL inside the receiver short-circuits the same way
export function callMid(a) {
  var _ref, _ref3, _ref2, _ref4;
  return null == (_ref = a?.get) || null == (_ref2 = _flatMaybeArray(_ref3 = _ref.call(a).rows)) ? void 0 : _filterMaybeArray(_ref4 = _ref2.call(_ref3))?.call(_ref4, Boolean).length;
}