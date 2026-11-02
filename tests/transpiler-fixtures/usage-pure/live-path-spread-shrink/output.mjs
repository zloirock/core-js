import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// Removing an empty spread keeps the constructor and the rest at their original positions.
export const [{
  groupBy
}, ...rest] = [_Map, _Set];