// a call reading no key - a function a call returns, a private method - is a route the census does not
// follow: a constructor such a call returns keeps its narrow entry in pure, which carries none of its
// statics. where the read side names the callee itself - an extracted method, an accessor - it serves
// the static read; a construction and a builtin callback read no static at all
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
