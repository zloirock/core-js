import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a guarded static read whose receiver carries an effect prefix re-reads the name behind it and keeps the
// `?.` the read wears: where the name holds a nullish value the read short-circuits as written
let M = _Map;
if (flag) M = null;
let count = 0;
export const grouped = (count++, M === _Map ? _Map$groupBy : M?.groupBy);