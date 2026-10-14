import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// An assignment over a literal whose claimed slot runs code keeps a reader beside the claim - a sibling key
// ahead of it or behind it, a second slot that runs code, a deeper level: the literal is captured once,
// where the source builds it, and the claim reads its slot off the capture - in a statement, an unbraced
// body and a discarded sequence element.
const list = [3, [1, 2]];
function make() {
  return [1, 2];
}
let at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex;
_ref = {
  y: _flatMaybeArray(list).call(list),
  o: 1
};
at = _atMaybeArray(_ref.y);
({
  o: after
} = _ref);
_ref2 = {
  y: make(),
  z: make()
};
includes = _includesMaybeArray(_ref2.y);
({
  z: twin
} = _ref2);
if (list) {
  _ref3 = {
    y: new Array(1, 2),
    o: 2
  };
  findLast = _findLastMaybeArray(_ref3.y);
  ({
    o: guarded
  } = _ref3);
}
seq = (_ref4 = {
  x: {
    y: make()
  },
  o: 3
}, {
  x: _ref5
} = _ref4, toSorted = _toSortedMaybeArray(_ref5.y), {
  o: kept
} = _ref4, 5);
_ref6 = {
  o: 4,
  y: make()
};
({
  o: before
} = _ref6);
findLastIndex = _findLastIndexMaybeArray(_ref6.y);
export { at, after, includes, twin, findLast, guarded, toSorted, kept, seq, before, findLastIndex };