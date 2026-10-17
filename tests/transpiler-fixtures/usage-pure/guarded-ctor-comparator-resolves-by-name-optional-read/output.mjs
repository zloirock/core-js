import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
export function optionalRead(c) {
  let M;
  if (c) M = _Map;
  return M === _Map ? _Map$groupBy : M?.groupBy;
}