import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the same hop AFTER the write reads the live constructor - narrows like the direct form
let M3;
M3 = _Map;
const HopAfter = M3;
export const c = _Map$groupBy(items, keyFn);