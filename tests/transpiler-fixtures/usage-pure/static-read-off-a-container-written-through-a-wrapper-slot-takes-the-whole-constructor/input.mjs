// a container held in a slot of another literal is that slot's value: a write through the wrapper's slot,
// or through an alias of it, lands on the container, so a static read off the container holds no constructor
// its literal spelled, stays as written, and the constructor takes its whole entry - an object wrapper, an
// alias of its slot and an array wrapper alike, one constructor per row. a wrapper no write goes through
// leaves the read served by name
const maps = { C: Map };
const mapsBox = { inner: maps };
if (globalThis.c) mapsBox.inner.C = null;
export const grouped = maps.C.groupBy([1, 2], x => x % 2);
const promises = { C: Promise };
const promisesBox = { inner: promises };
const promisesInner = promisesBox.inner;
if (globalThis.c) promisesInner.C = null;
export const resolvers = typeof promises.C.withResolvers;
const iterators = { C: Iterator };
const list = [iterators];
if (globalThis.c) list[0].C = null;
export const iterated = typeof iterators.C.from;
const symbols = { C: Symbol };
const symbolsBox = { inner: symbols };
export const registered = typeof symbols.C.for('k');
