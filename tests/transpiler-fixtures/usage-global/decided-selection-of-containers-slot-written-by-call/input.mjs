// a call the binding of a decided selection of containers is handed to, writing the slot through its
// parameter before the read, puts its value there as it does for a plain container: the written
// constructor's static is loaded, and the static of the container the selection yields is not
const grouped = typeof Symbol != 'undefined' ? { C: Map } : { C: Set };
function regroup(target) {
  target.C = Object;
}
regroup(grouped);
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = { C: Iterator } || { C: Set };
function relist(target) {
  target.C = Array;
}
relist(listed);
export const copied = listed.C.from([1]);
