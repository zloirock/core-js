import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
function make() {
  return _Map;
}
const m = make();
_Map$groupBy([1], value => value);
function f({
  groupBy
} = {
  groupBy: _Map$groupBy
}) {
  return groupBy;
}