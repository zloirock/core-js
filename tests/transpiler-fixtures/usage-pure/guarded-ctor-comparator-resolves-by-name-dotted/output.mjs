import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// The runtime ctor guard's comparator is SYNTHESIZED - the source spells no constructor where it stands - so it resolves the ctor
// BY NAME, with no path standing in for one: handed the member's path, the resolve would read `M.groupBy`'s own call shape through
// the desc's filters.
export function dotted(c) {
  let M;
  if (c) M = _Map;
  return M === _Map ? _Map$groupBy : M.groupBy;
}