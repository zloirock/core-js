// a name aliasing a member path stands for the slot the path's root files its writes under: a slot written
// through the root, or through another alias of the path, holds no constructor the literal spelled, so the
// read through the alias stays as written and the constructor takes its whole entry - a member alias, a
// pattern alias and a deep path alike, one constructor per row. an unwritten slot is served by name
const maps = { inner: { C: Map } };
const mapsInner = maps.inner;
if (globalThis.c) maps.inner.C = null;
export const grouped = mapsInner.C.groupBy([1, 2], x => x % 2);
const promises = { inner: { C: Promise } };
const { inner: promisesInner } = promises;
if (globalThis.c) promises.inner.C = null;
export const resolvers = typeof promisesInner.C.withResolvers;
const iterators = { a: { b: { C: Iterator } } };
const deep = iterators.a.b;
const other = iterators.a.b;
if (globalThis.c) other.C = null;
export const iterated = typeof deep.C.from;
const symbols = { inner: { C: Symbol } };
const symbolsInner = symbols.inner;
export const registered = typeof symbolsInner.C.for('k');
