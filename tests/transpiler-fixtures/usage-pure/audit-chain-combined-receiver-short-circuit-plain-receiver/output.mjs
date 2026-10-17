import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// NEGATIVE: no live `?.` in the receiver - the helper's own member read must throw
export function plainReceiver(arr) {
  var _ref, _ref2;
  return null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, x => x).length;
}