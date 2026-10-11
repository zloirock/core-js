import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A const alias of a selection the build decides holds its live operand, so a parameter default
// reading it mirrors that operand like the plain alias does.
const decided = [_Map];
export function viaAlias([{
  groupBy
}] = [{
  groupBy: _Map$groupBy
}]) {
  return groupBy;
}