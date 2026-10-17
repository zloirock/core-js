import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref, _ref2;
// Two literal receivers in one declaration keep independent captures.
const {
  next: nx = _findLastMaybeArray(_ref = [1]).call(_ref, Boolean)
} = _getIteratorMethod([14]);
const {
  name: ny = _findLastIndexMaybeArray(_ref2 = [2]).call(_ref2, Boolean)
} = _getIteratorMethod([15]);
export const viaTwoMemos = [nx, ny];