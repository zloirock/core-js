import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// optional-IIFE arrow as receiver root: `(() => Map)?.().has(1)` inlines the IIFE return to
// Map and substitutes the whole receiver with `_Map`. unplugin must mark the inner `Map`
// Identifier skipped before its visitor runs, else the parallel `Map` substitution composes
// inside the outer `_Map` emit and produces `__Map`. parallel form exercises Set.intersection.
const a = _Map.has(1);
const b = _Set.intersection(new _Set([1]));
export { a, b };