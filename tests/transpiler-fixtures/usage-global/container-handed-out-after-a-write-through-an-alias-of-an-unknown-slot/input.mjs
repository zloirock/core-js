// a constructor written through an alias of a slot read by a key no canon names lands somewhere under the
// container, so the container handed out, or read again by such a key, owes the written constructor's whole
// family, as the write spelled through the slot does
const box = { inner: { C: Array } };
const slot = box[k];
slot.C = Iterator;
export default box;
const pool = { a: { C: Object } };
const each = pool[i];
each.C = Map;
export const read = pool[j].C.groupBy([1], x => x);
