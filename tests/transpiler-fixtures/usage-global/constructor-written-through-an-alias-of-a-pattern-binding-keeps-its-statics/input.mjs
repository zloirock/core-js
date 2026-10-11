// a binding a pattern takes off a container stands for that slot wherever it goes next, so a constructor
// written through any of these reaches a static read back through the container's path - an alias of the
// binding, a write one level deeper through it, a pattern taken off it in turn, and a pattern taken off a
// member-path alias
const box = { inner: { C: Array } };
const { inner: alias } = box;
const copy = alias;
copy.C = Iterator;
export const copied = box.inner.C.from([1]);
const holder = { inner: { deep: { C: Object } } };
const { inner: held } = holder;
held.deep.C = Map;
export const grouped = holder.inner.deep.C.groupBy([1], x => x);
const nest = { inner: { deep: { C: Array } } };
const { inner: outer } = nest;
const { deep } = outer;
deep.C = Promise;
export const settled = nest.inner.deep.C.allSettled([]);
const tree = { inner: { deep: { C: Object } } };
const branch = tree.inner;
const { deep: leaf } = branch;
leaf.C = Symbol;
export const registered = tree.inner.deep.C.for('a');
