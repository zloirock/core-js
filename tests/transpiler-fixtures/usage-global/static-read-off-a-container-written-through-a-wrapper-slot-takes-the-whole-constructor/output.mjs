import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a container held in a slot of another literal is that slot's value: a write through the wrapper's slot,
// or through an alias of it, lands on the container, so a static read off the container holds no constructor
// its literal spelled, stays as written, and the constructor takes its whole entry - an object wrapper, an
// alias of its slot and an array wrapper alike, one constructor per row. a wrapper no write goes through
// leaves the read served by name
const maps = {
  C: Map
};
const mapsBox = {
  inner: maps
};
if (globalThis.c) mapsBox.inner.C = null;
export const grouped = maps.C.groupBy([1, 2], x => x % 2);
const promises = {
  C: Promise
};
const promisesBox = {
  inner: promises
};
const promisesInner = promisesBox.inner;
if (globalThis.c) promisesInner.C = null;
export const resolvers = typeof promises.C.withResolvers;
const iterators = {
  C: Iterator
};
const list = [iterators];
if (globalThis.c) list[0].C = null;
export const iterated = typeof iterators.C.from;
const symbols = {
  C: Symbol
};
const symbolsBox = {
  inner: symbols
};
export const registered = typeof symbols.C.for('k');