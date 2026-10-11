import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a global's own value written back into its slot through a pattern - a key read off the realm, a key under a
// realm hop, an element paired with a realm read - puts the whole entry into the slot, and a later read of the
// same global keeps working
Map = _Map;
({
  self: {
    Set
  }
} = {
  self: {
    Set: _Set
  }
});
[WeakMap] = [_WeakMap];
export const grouped = _Map$groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
export const weak = new WeakMap([[grouped, 1]]).has(grouped);