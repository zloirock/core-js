import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A nested level under an iterator key spelled through an alias, beside an instance claim, reads like its
// dotted spelling in both emitters: the receiver memoizes once, the level destructures the helper result of
// the iterator method off the memo and the claim beside it dispatches on the same memo - no residual reads
// the iterator slot a second time.
const it = _Symbol$iterator;
const _ref = getArr();
const {
  next
} = _getIteratorMethod(_ref);
const f = _flatMaybeArray(_ref);
export { next, f };