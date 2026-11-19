import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set";
// A hole inside a written spread still yields undefined.
// Later constructor rewrites preserve the spread's native iteration.
const [, {
  from
}, ...rest] = [...[, Array], _Map, _Set];
export { from, rest };