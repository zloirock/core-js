// a call no callee answers - a class member, a method whose owner reads `this`, an array slot - is a
// route the census does not follow: a constructor such a call returns keeps its narrow entry in pure,
// which carries none of its statics, and usage-global injects no static read off the result
class K {
  static map() { return Map; }
  promise() { return Promise; }
  static iterator() { return Iterator; }
  static run() { return this.iterator().from([1]); }
  static aggregate() { return AggregateError; }
  static suppressed() { return SuppressedError; }
}
const box = { tag: 1, symbol() { this.tag; return Symbol; } };
const slots = [() => URL];
export const grouped = K.map().groupBy([1], x => x);
export const resolvers = new K().promise().withResolvers();
export const iterated = K.run();
export const key = box.symbol().for('x');
export const parses = slots[0]().canParse('a:b');
K.suppressed();
