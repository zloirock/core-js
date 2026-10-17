import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// A plain instance leaf beside a pattern value uses the same captured receiver.
const _ref2 = [1, [2]];
const {
  length: arity = _atMaybeArray(_ref = [6]).call(_ref, 0)
} = _getIteratorMethod(_ref2);
const f = _flatMaybeArray(_ref2);
export const viaMixedLeaf = [arity, f];