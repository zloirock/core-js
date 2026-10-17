import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a kept prefix composes its own inner rewrites: the global read inside the surviving
// side effect substitutes even though the navigation around it is erased
function innerGlobal({
  groupBy: g4,
  none
} = (_globalThis.tick(), {
  groupBy: _Map$groupBy,
  none: _Map.none
})) {
  return [g4, none];
}
innerGlobal();