import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// A member receiver is read once before nested extraction.
const _ref2 = holder.list,
  {
    next: memberNext = _flatMaybeArray(_ref = [7]).call(_ref)
  } = _getIteratorMethod(_ref2),
  {
    tail
  } = _ref2;
export const viaMemberControl = [memberNext, tail];