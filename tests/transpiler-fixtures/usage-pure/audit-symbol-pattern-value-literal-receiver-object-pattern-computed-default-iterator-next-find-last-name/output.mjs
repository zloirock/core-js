import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref, _ref2, _ref3;
// Two literal receivers in one declaration keep independent captures.
const {
  next: nx = _findLastMaybeArray(_ref = [1]).call(_ref, Boolean)
} = _getIteratorMethod([14]);
const ny = (_ref2 = _nameMaybeFunction(_getIteratorMethod([15]))) === void 0 ? _findLastIndexMaybeArray(_ref3 = [2]).call(_ref3, Boolean) : _ref2;
export const viaTwoMemos = [nx, ny];