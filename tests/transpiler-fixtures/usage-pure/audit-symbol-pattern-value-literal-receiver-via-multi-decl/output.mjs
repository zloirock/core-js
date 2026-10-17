import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
const before = 1;
const {
  name: midName = _entriesMaybeArray(_ref = [2]).call(_ref)
} = _getIteratorMethod([12]);
const after = 2;
export const viaMultiDecl = [before, midName, after];