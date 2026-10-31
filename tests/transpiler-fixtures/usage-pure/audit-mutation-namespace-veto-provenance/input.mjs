// a local Object / Reflect shadow silences only the BARE mutator callee (the local twin is not
// the global namespace) - a proxy-global chain, direct or aliased, names the REAL namespace, so
// its patch is recorded and the mutated static keeps the user override (routed through the
// injected constructor). the bare shadowed call is a plain local call: its target is NOT a
// recorded mutation, so the read still substitutes
const Object = { defineProperty() {} };
const Reflect = { set() {} };
globalThis.Object.defineProperty(Array, 'from', { value: custom });
const r1 = Array.from([1]);
const g = globalThis;
g.Object.defineProperty(Iterator, 'from', { value: custom2 });
const r2 = Iterator.from(r1);
globalThis.Reflect.set(Map, 'groupBy', custom3);
const r3 = Map.groupBy(r2, fn);
Object.defineProperty(Promise, 'try', { value: custom4 });
const r4 = Promise.try(fn);
