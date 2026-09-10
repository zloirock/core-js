// popular third-party shim patterns: a guarded mutation on a global core-js ponyfills as a
// CONSTRUCTOR routes through the injected one, and the mutated key's own entry is imported up front
// (polyfill-then-patch), so the guard finds the key present and the shim stays dead code. `Array`
// and `Object` have no constructor to inject: those rows stay native, the guard fires on the target
// and the third-party shim is what runs
if (!Array.from) Array.from = shimFrom;
export const r1 = Array.from(x);
Promise.allSettled = Promise.allSettled || shimAllSettled;
export const r2 = Promise.allSettled(ps);
Iterator.from ||= shimIterFrom;
export const r3 = Iterator.from(it);
if (typeof Object.groupBy !== 'function') Object.groupBy = shimGroupBy;
export const r4 = Object.groupBy(items, fn);
if (!Map.groupBy) Object.defineProperty(Map, 'groupBy', { value: shimMapGroupBy });
export const r5 = Map.groupBy(items, fn);
