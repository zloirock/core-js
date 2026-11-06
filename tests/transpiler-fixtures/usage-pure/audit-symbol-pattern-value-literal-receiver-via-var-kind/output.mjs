import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// Declaration kinds and neighboring declarators retain source order for nested extraction.
var _ref2 = [10, 11],
  {
    next: varNext = _withMaybeArray(_ref = [1]).call(_ref, 0, 2)
  } = _getIteratorMethod(_ref2),
  {
    fifth
  } = _ref2;
export const viaVarKind = [varNext, fifth];