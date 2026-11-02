import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set";
// An unbound hole stays a hole while expanding a literal spread.
// Later constructor rewrites use their actual slots after that expansion.
const [, {
  from
}, ...rest] = [, Array, _Map, _Set];
export { from, rest };