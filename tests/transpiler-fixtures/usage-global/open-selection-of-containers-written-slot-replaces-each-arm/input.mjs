// a write that runs before the read replaces the slot of whichever container an open selection holds, through
// the binding or through a call it is handed to, as it does for a plain container: usage-global loads the
// written constructor's static and not the arms', and usage-pure, which reads a written slot natively, keeps
// the entries carrying the statics
const grouped = flag ? { C: Map } : { C: Set };
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = flag ? { C: Iterator } : { C: Set };
listed.C = Array;
export const copied = listed.C.from([1]);
