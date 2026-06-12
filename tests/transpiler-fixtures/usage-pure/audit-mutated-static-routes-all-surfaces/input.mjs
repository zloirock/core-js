// every surface of a monkey-patched static routes through the injected constructor - the
// patch and all observers share one object, working even when the native global is missing
// on the target. delete, in-check, proxy-chain write and destructure all follow the write
delete Iterator.from;
export const r1 = Iterator.from(x);
Map.groupBy = c1;
const { groupBy } = Map;
export const r2 = groupBy(items, fn);
globalThis.Promise.try = c2;
export const r3 = Promise.try(fn);
function supplier() { return Object; }
const O = supplier();
O.groupBy = c3;
export const r4 = 'groupBy' in Object;
// method-aware precision: a CLEAN key on the patched constructor keeps its receiver-less
// import; a computed static-string key routes like the dot form; a parameter shadow is not
// the global; `new` on a patched constructor uses the same injected object
export const r5 = Iterator.zip(zs);
Array['of'] = c4;
export const r6 = Array.of(1);
function shadowed(Reflect) { Reflect.ownKeys = c5; }
export const r7 = Reflect.ownKeys(obj);
Map.getOrInsert = c6;
export const r8 = new Map();
// mutation targets behind transparent wrappers route too: an optional delete (estree wraps
// the chain), an oxc-preserved paren delete and a paren compound assignment
delete Iterator?.toAsync;
delete (Map.customParenDel);
(Set.customParenOr) ||= parenShim;
// nested-proxy and array-wrapped destructures of a mutated key route like every other
// surface (the dispatch-side gate covers the emitters' own meta constructors too)
const { Map: { set: setAlias } } = globalThis;
Map.set = setPatch;
export const r9 = setAlias;
const [{ entries: entriesAlias }] = [Object];
Object.entries = entriesPatch;
export const r10 = entriesAlias;
// one pattern, mixed keys: the clean sibling still flattens, only the mutated one stays raw
const { Promise: { try: tryAlias, allSettled: asAlias } } = globalThis;
Promise.allSettled = asPatch;
export const r11 = [tryAlias, asAlias];
