import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// G-MUTATION-PREPASS: a monkey-patch through a destructure-leaf alias (`const { Map: M } = globalThis`)
// must mark the SAME global static mutated as a dotted patch would. the mutation pre-pass delegates the
// bound receiver to the read-side canon (resolveObjectName), which follows the `{ Map: M }` key (M -> Map)
// instead of the raw declarator init (`globalThis`). without it the read below was substituted to the
// separate `_Map$groupBy` polyfill, silently overwriting the user patch; with it the read keeps `_Map.groupBy`
const M = _Map;
M.groupBy = function () {};
export const a = _Map.groupBy([1], x => x);

// the bare-destructure form (key === binding name) resolves through the same canon, distinct static
const Iterator = _Iterator;
Iterator.range = function () {};
export const b = Iterator.range(0, 3);