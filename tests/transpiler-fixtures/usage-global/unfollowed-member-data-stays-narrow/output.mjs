import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a member value read back through `this` or an instance - an instance field, getter or constructor
// return, a static read through `this` in a static member or through a subclass, and a literal slot one
// of its functions reads through `this` - is a route the census does not follow, so pure keeps the
// narrow entry there, which carries none of the statics read through it
class A {
  map = Map;
  get promise() {
    return Promise;
  }
}
class B {
  constructor() {
    return Iterator;
  }
}
class C {
  static symbol = Symbol;
  static run() {
    return this.symbol.for('c');
  }
}
class E {
  static error = AggregateError;
}
class F extends E {
  static run() {
    return super.error.isError(null);
  }
}
const box = {
  url: URL,
  run() {
    return this.url.canParse('a:b');
  }
};
export const grouped = new A().map.groupBy([1], x => x);
export const resolvers = new A().promise.withResolvers();
export const iterated = new B().from([1]);
export const key = C.run();
export const isError = F.run();
export const parses = box.run();