import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _AggregateError$isError from "@core-js/pure/actual/aggregate-error/is-error";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url/constructor";
// A returned function remains outside callee following and keeps its narrow constructor.
// Private methods, extracted methods and accessors name the callee and serve its static read.
// A construction and a built-in callback read no static at all.
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
    return (K.#iterator(), _Iterator$from)([1]);
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