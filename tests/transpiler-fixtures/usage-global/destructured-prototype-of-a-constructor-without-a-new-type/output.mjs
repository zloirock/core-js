import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
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
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A destructured read off a constructor's prototype is typed by the constructor's name, as its member
// spelling `Ctor.prototype.key` is - also where `new` names no instance: the abstract Iterator and
// AsyncIterator, and Object, whose `new` may yield any object. No spelling loads another family's method,
// and a free name that only rhymes with a constructor names no family.
const {
  map
} = Iterator.prototype;
const {
  prototype: {
    filter
  }
} = Iterator;
const {
  Iterator: {
    prototype: {
      flatMap
    }
  }
} = globalThis;
let join;
({
  prototype: {
    join
  }
} = Iterator);
for (const {
  prototype: {
    find
  }
} of [Iterator]) find;
const proto = Iterator.prototype;
const {
  includes
} = proto;
const {
  prototype: {
    forEach
  }
} = AsyncIterator;
const {
  toString
} = Object.prototype;
const {
  at
} = iterator.prototype;
export { map, filter, flatMap, join, includes, forEach, toString, at };