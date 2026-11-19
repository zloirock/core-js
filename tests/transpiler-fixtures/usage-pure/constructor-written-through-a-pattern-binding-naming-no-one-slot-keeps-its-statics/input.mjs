// a binding a pattern takes off a container lands its writes on that container even where the pattern names
// no one slot for it - a default keeps the path, a rest or a key no canon folds stands for some slot under
// the container - so a static read back through the container's path reaches the written constructor's static
const box = { inner: { C: Array } };
const { inner: withDefault = {} } = box;
withDefault.C = Iterator;
export const copied = box.inner.C.from([1]);
const holder = { inner: { C: Object } };
const { ...rest } = holder;
rest.inner.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const tree = { inner: { C: Object } };
const { [key]: picked } = tree;
picked.C = Promise;
export const settled = tree.inner.C.allSettled([]);
