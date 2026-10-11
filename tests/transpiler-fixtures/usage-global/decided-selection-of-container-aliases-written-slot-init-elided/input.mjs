// a write through an alias holding a selection of containers the build decides lands on the container the
// selection yields, as one through a plain alias does: written before the read, it replaces that slot, so
// the replaced value's static is not loaded. an alias the build cannot decide may hold either container -
// its write replaces neither slot for certain, and the read takes the initial value or the written one
const grouped = { C: Map };
const spare = { C: Set };
const viaDecided = typeof Symbol != 'undefined' ? grouped : spare;
viaDecided.C = Object;
export const byParity = grouped.C.groupBy([1, 2], x => x % 2);
const listed = { C: Array };
const other = { C: Set };
const viaOpen = flag ? listed : other;
viaOpen.C = Iterator;
export const copied = listed.C.from([1]);
