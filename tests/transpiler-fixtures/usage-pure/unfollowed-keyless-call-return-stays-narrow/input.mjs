// A returned function remains outside callee following and keeps its narrow constructor.
// Private methods, extracted methods and accessors name the callee and serve its static read.
// A construction and a built-in callback read no static at all.
const box = { map() { return Map; } };
const { map } = box;
function outer() { return () => Promise; }
class K {
  static #iterator() { return Iterator; }
  static run() { return K.#iterator().from([1]); }
  static get error() { return AggregateError; }
}
function url() { return URL; }
export const grouped = map().groupBy([1], x => x);
export const resolvers = outer()().withResolvers();
export const iterated = K.run();
export const isError = K.error.isError(null);
export const link = new (url())('a:b');
export const symbols = [0].forEach(() => Symbol);
