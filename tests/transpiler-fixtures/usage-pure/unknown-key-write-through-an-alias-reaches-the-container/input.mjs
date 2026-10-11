// a write under an unknown key through an alias of a container - a member path, a name, a selection of names
// or of a member path - lands on that container, so a static read back through it takes the entry carrying
// the written constructor's statics, as the write spelled through the container does; an alias of a container
// nothing reads back keeps the constructor's own entry
const box = { inner: { C: Array } };
const path = box.inner;
path[k] = Iterator;
export const copied = box.inner.C.from([1]);
const listed = { C: Object };
const name = listed;
name[k] = Map;
export const grouped = listed.C.groupBy([1], x => x);
const first = { C: Object };
const other = { C: Object };
const either = flag ? first : other;
either[k] = Promise;
export const settled = first.C.allSettled([]);
const holder = { inner: { C: Object } };
const spare = { C: Object };
const picked = flag ? holder.inner : spare;
picked[k] = Symbol;
export const registered = holder.inner.C.for('a');
const quiet = { C: Object };
const unread = quiet;
unread[k] = URL;
