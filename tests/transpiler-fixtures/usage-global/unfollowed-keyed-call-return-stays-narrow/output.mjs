import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.suppressed-error.constructor";
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
// a call no callee answers - a class member, a method whose owner reads `this`, an array slot - is a
// route the census does not follow: a constructor such a call returns keeps its narrow entry in pure,
// which carries none of its statics, and usage-global injects no static read off the result
class K {
  static map() {
    return Map;
  }
  promise() {
    return Promise;
  }
  static iterator() {
    return Iterator;
  }
  static run() {
    return this.iterator().from([1]);
  }
  static aggregate() {
    return AggregateError;
  }
  static suppressed() {
    return SuppressedError;
  }
}
const box = {
  tag: 1,
  symbol() {
    this.tag;
    return Symbol;
  }
};
const slots = [() => URL];
export const grouped = K.map().groupBy([1], x => x);
export const resolvers = new K().promise().withResolvers();
export const iterated = K.run();
export const key = box.symbol().for('x');
export const parses = slots[0]().canParse('a:b');
K.suppressed();