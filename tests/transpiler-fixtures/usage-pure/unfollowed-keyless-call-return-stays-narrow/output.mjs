import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _AggregateError$isError from "@core-js/pure/actual/aggregate-error/is-error";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url/constructor";
// a call reading no key - a function a call returns, a private method - is a route the census does not
// follow: a constructor such a call returns keeps its narrow entry in pure, which carries none of its
// statics. where the read side names the callee itself - an extracted method, an accessor - it serves
// the static read; a construction and a builtin callback read no static at all
const box = {
  map() {
    return _Map;
  }
};
const {
  map
} = box;
function outer() {
  return () => _Promise;
}
class K {
  static #iterator() {
    return _Iterator;
  }
  static run() {
    return K.#iterator().from([1]);
  }
  static get error() {
    return _AggregateError;
  }
}
function url() {
  return _URL;
}
export const grouped = _Map$groupBy([1], x => x);
export const resolvers = outer()().withResolvers();
export const iterated = K.run();
export const isError = _AggregateError$isError(null);
export const link = new (url())('a:b');
export const symbols = [0].forEach(() => _Symbol);