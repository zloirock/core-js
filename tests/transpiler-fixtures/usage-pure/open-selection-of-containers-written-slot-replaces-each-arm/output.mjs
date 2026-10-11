import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// a write that runs before the read replaces the slot of whichever container an open selection holds, through
// the binding or through a call it is handed to, as it does for a plain container: usage-global loads the
// written constructor's static and not the arms', and usage-pure, which reads a written slot natively, keeps
// the entries carrying the statics
const grouped = flag ? {
  C: _Map
} : {
  C: _Set
};
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = flag ? {
  C: _Iterator
} : {
  C: _Set
};
listed.C = Array;
export const copied = listed.C.from([1]);