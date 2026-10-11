import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a global's own value written back into its slot through the bare name - read off a realm name, off another
// realm name, by a logical write - puts the whole entry into the slot, where other code reads its statics off
// the realm. a later read of the same global keeps working
Map = _Map;
Set = _Set;
WeakMap &&= _WeakMap;
export const grouped = _Map$groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new _Set([1, 1]).size;
export const weak = new _WeakMap([[grouped, 1]]).has(grouped);