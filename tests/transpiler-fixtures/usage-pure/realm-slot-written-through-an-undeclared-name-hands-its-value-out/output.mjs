import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a value written into a name no declaration reaches lands in the realm's slot of that name, out of the file: the
// constructor it holds takes its whole entry, written flat or through a pattern. a name the file declares keeps
// its value home, on the narrow entry
Holder = _Map;
Hook = _Set;
let local;
local = _WeakMap;
export const grouped = Holder.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Hook([1, 1]).size;
export const weak = new local([[grouped, 1]]).has(grouped);