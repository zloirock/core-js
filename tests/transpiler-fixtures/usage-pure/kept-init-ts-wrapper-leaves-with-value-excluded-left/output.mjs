import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
_globalThis.Map || (log(), _Set);
// A TS wrapper around an init a static claim empties leaves with the value it wraps: a selection whose left
// the build does not serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own)
// stays live, its operands spelled bare ahead of the claim - in a declaration, and in a bodyless slot, which
// becomes a block.
const groupBy = _Map$groupBy;
if (ok) {
  _globalThis.Map ?? make();
  var grouped = _Map$groupBy;
}
export { groupBy, grouped };