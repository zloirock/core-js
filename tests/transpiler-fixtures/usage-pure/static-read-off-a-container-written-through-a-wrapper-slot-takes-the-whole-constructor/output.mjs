import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// a container held in a slot of another literal is that slot's value: a write through the wrapper's slot,
// or through an alias of it, lands on the container, so a static read off the container holds no constructor
// its literal spelled, stays as written, and the constructor takes its whole entry - an object wrapper, an
// alias of its slot and an array wrapper alike, one constructor per row. a wrapper no write goes through
// leaves the read served by name
const maps = {
  C: _Map
};
const mapsBox = {
  inner: maps
};
if (_globalThis.c) mapsBox.inner.C = null;
export const grouped = maps.C.groupBy([1, 2], x => x % 2);
const promises = {
  C: _Promise
};
const promisesBox = {
  inner: promises
};
const promisesInner = promisesBox.inner;
if (_globalThis.c) promisesInner.C = null;
export const resolvers = typeof promises.C.withResolvers;
const iterators = {
  C: _Iterator
};
const list = [iterators];
if (_globalThis.c) list[0].C = null;
export const iterated = typeof iterators.C.from;
const symbols = {
  C: _Symbol
};
const symbolsBox = {
  inner: symbols
};
export const registered = typeof _Symbol$for('k');