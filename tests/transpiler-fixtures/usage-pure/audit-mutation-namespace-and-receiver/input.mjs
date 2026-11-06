// Mutation through an Object / Reflect namespace reached as a proxy-global member chain - direct
// (`globalThis.Reflect`, `self.Object`), aliased (`const g = globalThis; g.Reflect.set`) or hopped
// (`globalThis.self.Reflect.set`) - names the SAME global namespace, resolved through the canonical
// proxy-global member resolver, so the patch is detected and the static read routes through the ponyfill
// constructor. `Reflect.set(target, key, value, RECEIVER)` redirects the write to the receiver, the real
// mutation host. distinct statics pin which shape was detected.
globalThis.Reflect.set(Map, "groupBy", patchA);
const r1 = Map.groupBy(items, fn);
Reflect.set({}, "try", patchB, Promise);
const r2 = Promise.try(fn);
self.Object.assign(Iterator, { from: patchC });
const r3 = Iterator.from(src);
const g = globalThis;
g.Reflect.set(Promise, "any", patchD);
const r4 = Promise.any(list);
globalThis.self.Reflect.set(Promise, "all", patchE);
const r5 = Promise.all(list);
export { r1, r2, r3, r4, r5 };
