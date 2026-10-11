// an explicit store into a member path lands on the slot under that path, as a member write spelled through it
// does, so a static read back through the path loads the stored constructor's static - `Object.assign` with a
// known or an unknown key, and `Reflect.set`
const box = { inner: { C: Object } };
Object.assign(box.inner, { C: Map });
export const grouped = box.inner.C.groupBy([1], x => x);
const holder = { inner: { C: Array } };
Object.assign(holder.inner, { [key]: Iterator });
export const copied = holder.inner.C.from([1]);
const tree = { inner: { C: Object } };
Reflect.set(tree.inner, 'C', Promise);
export const settled = tree.inner.C.allSettled([]);
