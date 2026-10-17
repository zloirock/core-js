import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
var _ref, _ref2;
// Literal assignments keep initializer effects ahead of nested method reads and preserve sibling order.
// Quiet trailing values can be assigned directly; other effectful slots and preceding sibling reads
// retain the required source value. Statement, unbraced body and sequence hosts keep that order.
const list = [3, [1, 2]];
function make() {
  return [1, 2];
}
let at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex;
at = _atMaybeArray(_flatMaybeArray(list).call(list));
after = 1;
_ref = {
  y: make(),
  z: make()
};
includes = _includesMaybeArray(_ref.y);
({
  z: twin
} = _ref);
if (list) {
  findLast = _findLastMaybeArray(new Array(1, 2));
  guarded = 2;
}
seq = (toSorted = _toSortedMaybeArray(make()), kept = 3, 5);
_ref2 = {
  o: 4,
  y: make()
};
({
  o: before
} = _ref2);
findLastIndex = _findLastIndexMaybeArray(_ref2.y);
export { at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex };