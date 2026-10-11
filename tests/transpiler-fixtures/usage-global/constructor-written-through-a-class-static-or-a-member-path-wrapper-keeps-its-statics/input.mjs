// a wrapper's slot holding a container makes the slot that container - a class's static field, an object or
// array literal's slot holding a member path - so a constructor written through the wrapper owes its family to
// a static read back through the container
const inner = { C: Object };
class Holder { static v = inner; }
Holder.v.C = Map;
export const grouped = inner.C.groupBy([1], x => x);
const box = { inner: { C: Object } };
const keeper = { ref: box.inner };
keeper.ref.C = Promise;
export const settled = box.inner.C.allSettled([]);
const nest = { inner: { C: Object } };
const listed = [nest.inner];
listed[0].C = Symbol;
export const registered = nest.inner.C.for('a');
