import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// An empty spread stays written while later constructor slots are rewritten.
export const [{
  groupBy
}, ...rest] = [...[], _Map, _Set];