// popular third-party shim patterns: every GUARDED mutation routes through the injected
// constructor, and the mutated key's own entry is imported up front (polyfill-then-patch).
// the guard finds the key present on the ponyfill, so the shim stays dead code and every
// surface (the guard read, the write, the later reads) works on every target - including
// engines missing the global natively
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
