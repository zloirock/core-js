import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// optional-IIFE arrow as receiver root: `(() => Map)?.().has(1)` -> resolver inlines the
// IIFE return to Map, falls back to substituting the whole receiver with `_Map`.
// unplugin must mark the inner `Map` Identifier as skipped (via `unwrapReceiverLeaf`)
// before the Identifier visitor runs - otherwise the parallel `Map -> _Map` substitution
// composes inside the outer's `_Map` emit and produces `__Map` (double-underscore bug).
// parallel form exercises Set.prototype.intersection
const a = (_Map.has)(1);
const b = (_Set.intersection)(new _Set([1]));
export { a, b };