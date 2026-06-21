// optional-IIFE arrow as receiver root: `(() => Map)?.().has(1)` inlines the IIFE return to
// Map and substitutes the whole receiver with `_Map`. unplugin must mark the inner `Map`
// Identifier skipped before its visitor runs, else the parallel `Map` substitution composes
// inside the outer `_Map` emit and produces `__Map`. parallel form exercises Set.intersection.
const a = (() => Map)?.().has(1);
const b = (() => Set)?.().intersection(new Set([1]));
export { a, b };
