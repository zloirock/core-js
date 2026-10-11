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
// a name aliasing a member path stands for the slot the path's root files its writes under: a slot written
// through the root, or through another alias of the path, holds no constructor the literal spelled, so the
// read through the alias stays as written and the constructor takes its whole entry - a member alias, a
// pattern alias and a deep path alike, one constructor per row. an unwritten slot is served by name
const maps = {
  inner: {
    C: Map
  }
};
const mapsInner = maps.inner;
if (globalThis.c) maps.inner.C = null;
export const grouped = mapsInner.C.groupBy([1, 2], x => x % 2);
const promises = {
  inner: {
    C: Promise
  }
};
const {
  inner: promisesInner
} = promises;
if (globalThis.c) promises.inner.C = null;
export const resolvers = typeof promisesInner.C.withResolvers;
const iterators = {
  a: {
    b: {
      C: Iterator
    }
  }
};
const deep = iterators.a.b;
const other = iterators.a.b;
if (globalThis.c) other.C = null;
export const iterated = typeof deep.C.from;
const symbols = {
  inner: {
    C: Symbol
  }
};
const symbolsInner = symbols.inner;
export const registered = typeof symbolsInner.C.for('k');