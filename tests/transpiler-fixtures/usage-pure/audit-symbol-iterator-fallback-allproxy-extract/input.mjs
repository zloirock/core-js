// Static and symbol-iterator claims share the same selected realm.
// Each keeps its own pure value and any rest exclusions.
const { [Symbol.iterator]: it, ...r } = c ? globalThis : self;
it;
r;
const { [Symbol.iterator]: it2, Array: { from: f } } = c ? globalThis : self;
it2;
f(x);
