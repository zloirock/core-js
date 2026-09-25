// on targets that carry the realm natively there is no realm entry to compare through, and the
// raw `globalThis` IS the realm on every one of them: the realm-proxy candidates (`window`, `self`,
// `globalThis`) collapse to that one comparator - never a bare `window` / `self`, which a
// non-browser target lacks. the static still needs its polyfill on these targets
var held = {};
var slot = held.k;
var probe;
slot = slot === void 0 ? (probe = globalThis.window) != null ? probe : globalThis : slot;
export const viaKeyed = slot.Map.groupBy;
var other = held.o;
other = other === void 0 ? self : other;
export const viaSelf = other.Promise.withResolvers;
// ... and through a name the realm hop is stored under first
var AliasedPromise = other.Promise;
export const viaStoredHop = AliasedPromise.try;
