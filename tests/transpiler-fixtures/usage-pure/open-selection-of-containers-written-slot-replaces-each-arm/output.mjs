import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Set from "@core-js/pure/actual/set";
// A write through the binding or a helper updates whichever container the selection returned.
// Both reads use the installed constructor's static.
const grouped = flag ? {
  C: _Map
} : {
  C: _Set
};
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = _Object$groupBy([1, 2], x => x % 2);
const listed = flag ? {
  C: _Iterator
} : {
  C: _Set
};
listed.C = Array;
export const copied = _Array$from([1]);