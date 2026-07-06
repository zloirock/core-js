// COMPUTED mutator-callee keys (static string, const alias, optional chain, computed proxy
// member), an ALIASED namespace and EXTRACTED / DESTRUCTURED mutator bindings all resolve
// through the same binding-aware canons as their dotted twins - each patched static keeps the
// user override and routes through the injected constructor
Object['defineProperty'](Array, 'from', { value: custom });
const r1 = Array.from([1]);
const m = 'defineProperty';
Object[m](Iterator, 'from', { value: custom2 });
const r2 = Iterator.from(r1);
Reflect['set'](Map, 'groupBy', custom3);
const r3 = Map.groupBy(r2, fn);
Object['defineProperties'](Promise, { try: { value: custom4 } });
const r4 = Promise.try(fn);
globalThis['Object'].defineProperty(Object, 'groupBy', { value: custom5 });
const r5 = Object.groupBy(r1, fn);
Object?.['assign']?.(Array, { of: custom6 });
const r6 = Array.of(1);
const O = Object;
O.defineProperty(Array, 'fromAsync', { value: custom7 });
const r7 = Array.fromAsync([1]);
const { defineProperty: dp } = Object;
dp(Iterator, 'zip', { value: custom8 });
const r8 = Iterator.zip([r1, r2]);
const rs = Reflect.set;
rs(Promise, 'allSettled', custom9);
const r9 = Promise.allSettled([r4]);
