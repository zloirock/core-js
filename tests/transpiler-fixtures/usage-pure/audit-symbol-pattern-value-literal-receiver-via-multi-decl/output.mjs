import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref, _ref2;
const before = 1;
const midName = (_ref = _nameMaybeFunction(_getIteratorMethod([12]))) === void 0 ? _entriesMaybeArray(_ref2 = [2]).call(_ref2) : _ref;
const after = 2;
export const viaMultiDecl = [before, midName, after];