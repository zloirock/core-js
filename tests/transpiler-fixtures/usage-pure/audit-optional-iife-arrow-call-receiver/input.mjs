// optional-IIFE arrow as receiver root: `(() => Map)?.().has(1)` -> resolver inlines the
// IIFE return to Map, falls back to substituting the whole receiver with `_Map`.
// unplugin must mark the inner `Map` Identifier as skipped (via `unwrapReceiverLeaf`)
// before the Identifier visitor runs - otherwise the parallel `Map -> _Map` substitution
// composes inside the outer's `_Map` emit and produces `__Map` (double-underscore bug).
// parallel form exercises Set.prototype.intersection
const a = (() => Map)?.().has(1);
const b = (() => Set)?.().intersection(new Set([1]));
export { a, b };
