import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an object SPREAD and a `__proto__` member are routes the census does not follow: a read through
// the copy or through the prototype names no value, so usage-global injects none of the statics read
// there, only the constructors themselves, while usage-pure keeps the whole entry of every constructor
// a spread hands out and leaves the `__proto__` route native
const src = {
  M: Map
};
const copy = {
  ...src
};
copy.M.groupBy(list, fn);
const inline = {
  ...{
    P: Promise
  }
};
inline.P.try(fn);
const pending = {
  M: Promise
};
const overridden = {
  ...pending,
  M: Object
};
overridden.M.allSettled(list);
const iterators = {
  I: Iterator
};
const nested = {
  w: {
    ...iterators
  }
};
nested.w.I.from(list);
const proto = {
  __proto__: {
    A: Array
  }
};
proto.A.of(1);