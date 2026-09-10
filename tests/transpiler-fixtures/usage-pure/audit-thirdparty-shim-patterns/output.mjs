import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// popular third-party shim patterns: a guarded mutation on a global core-js ponyfills as a
// CONSTRUCTOR routes through the injected one, and the mutated key's own entry is imported up front
// (polyfill-then-patch), so the guard finds the key present and the shim stays dead code. `Array`
// and `Object` have no constructor to inject: those rows stay native, the guard fires on the target
// and the third-party shim is what runs
if (!Array.from) Array.from = shimFrom;
export const r1 = Array.from(x);
_Promise.allSettled = _Promise.allSettled || shimAllSettled;
export const r2 = _Promise.allSettled(ps);
_Iterator.from ||= shimIterFrom;
export const r3 = _Iterator.from(it);
if (typeof Object.groupBy !== 'function') Object.groupBy = shimGroupBy;
export const r4 = Object.groupBy(items, fn);
if (!_Map.groupBy) Object.defineProperty(_Map, 'groupBy', {
  value: shimMapGroupBy
});
export const r5 = _Map.groupBy(items, fn);