import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref2, _ref3;
// A computed sibling key runs before the following iterator read and nested default.
let k = () => 'of';
const _ref = [3, 4];
const {
  [k()]: kf
} = _ref;
const nm = (_ref2 = _nameMaybeFunction(_getIteratorMethod(_ref))) === void 0 ? _atMaybeArray(_ref3 = [2]).call(_ref3, 0) : _ref2;
export const viaSeKeySibling = [kf, nm];