// A write through the binding or a helper updates whichever container the selection returned.
// Both reads use the installed constructor's static.
const grouped = flag ? { C: Map } : { C: Set };
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = flag ? { C: Iterator } : { C: Set };
listed.C = Array;
export const copied = listed.C.from([1]);
