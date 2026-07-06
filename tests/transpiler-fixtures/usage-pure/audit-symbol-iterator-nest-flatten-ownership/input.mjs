// a `[Symbol.iterator]` prop sharing its declarator with a proxy-global nest belongs to the
// FLATTEN (its plan synthesizes the extraction) no matter which prop the visitor dispatches
// first: a per-prop route firing beside the whole-declarator rebuild would double-consume
// the prop and crash the transform composition, or capture the receiver without its
// polyfill rewrite. an effectful init keeps the harvested prefix running exactly once ahead
// of the extractions
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
