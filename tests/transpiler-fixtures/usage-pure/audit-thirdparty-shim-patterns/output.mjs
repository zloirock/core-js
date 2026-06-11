import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// popular third-party shim patterns: every GUARDED mutation routes through the injected
// constructor, and the mutated key's own entry is imported up front (polyfill-then-patch).
// the guard finds the key present on the ponyfill, so the shim stays dead code and every
// surface (the guard read, the write, the later reads) works on every target - including
// engines missing the global natively
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