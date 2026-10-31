// a write through a selection of a container literal and a value holding no slot - a nullish arm, an `&&`'s
// left, the value only where it is falsy - lands on the container whenever it lands anywhere, so a static
// read back through the selection loads the written constructor's static
const grouped = flag ? { C: Map } : null;
grouped.C = Object;
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = ready && { C: Promise };
listed.C = Array;
export const copied = listed.C.from([1]);
