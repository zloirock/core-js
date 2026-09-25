import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _SuppressedError from "@core-js/pure/actual/suppressed-error/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url/constructor";
// a call no callee answers - a class member, a method whose owner reads `this`, an array slot - is a
// route the census does not follow: a constructor such a call returns keeps its narrow entry in pure,
// which carries none of its statics, and usage-global injects no static read off the result
class K {
  static map() {
    return _Map;
  }
  promise() {
    return _Promise;
  }
  static iterator() {
    return _Iterator;
  }
  static run() {
    return this.iterator().from([1]);
  }
  static aggregate() {
    return _AggregateError;
  }
  static suppressed() {
    return _SuppressedError;
  }
}
const box = {
  tag: 1,
  symbol() {
    this.tag;
    return _Symbol;
  }
};
const slots = [() => _URL];
export const grouped = K.map().groupBy([1], x => x);
export const resolvers = new K().promise().withResolvers();
export const iterated = K.run();
export const key = box.symbol().for('x');
export const parses = slots[0]().canParse('a:b');
K.suppressed();