import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// computed bracket access on global proxy with an empty template literal: `globalThis[``]`.
// the empty cooked key resolves to '' and falls through (an empty key cannot match any
// global), so this access does NOT polyfill. the sibling Map.groupBy still polyfills,
// confirming the visitor reached the file.
const x = _globalThis[``];
const groups = _Map$groupBy([1, 2, 3], n => n % 2);
groups;
x;