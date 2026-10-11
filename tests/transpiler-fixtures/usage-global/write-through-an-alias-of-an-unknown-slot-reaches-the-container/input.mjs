// a write through a name holding a slot read by a key no canon names lands somewhere under the container
// that slot sits in, as the write spelled through the slot does; the read by that key hands the container
// out whole, so each constructor written there owes its whole family, the static read back among them - a
// hop off the container itself or off a member of it, a known or an unknown key written
const box = { inner: { C: Array } };
const slot = box[k];
slot.C = Iterator;
export const copied = box.inner.C.from([1]);
const nest = { list: { a: { D: Object } } };
const deep = nest.list[i];
deep.D = Map;
export const grouped = nest.list.a.D.groupBy([1], x => x);
const pool = { a: { E: Object } };
const each = pool[i];
each[j] = Promise;
export const settled = pool.a.E.allSettled([]);
