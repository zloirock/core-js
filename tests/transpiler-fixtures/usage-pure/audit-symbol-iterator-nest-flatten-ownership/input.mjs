// A symbol-iterator claim and nested static share one receiver rewrite.
// Both values survive in either property order, with initializer effects running once.
const [{ [Symbol.iterator]: it, Array: { from: f }, ...r }] = [globalThis];
it;
f(x);
r;
const { [Symbol.iterator]: it2, Object: { fromEntries: fe }, ...r2 } = globalThis;
it2;
fe(y);
r2;
const { [Symbol.iterator]: it3, Map: { groupBy: g } } = (se(), globalThis);
it3;
g(z);
