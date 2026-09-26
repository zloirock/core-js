// A computed read before a nested static stays native when rest must exclude that read.
// Without rest, the ordinary shared receiver mirror still serves both claims.
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
