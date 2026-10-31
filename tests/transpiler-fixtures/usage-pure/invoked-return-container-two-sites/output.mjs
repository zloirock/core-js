import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A yielded container is filled per call, so a second call site with another constructor narrows
// neither: each read resolves to its own call's argument and takes that pure static.
function box(v) {
  return [v];
}
export const first = _Map$groupBy([1], x => x);
export const second = _Array$of(2);