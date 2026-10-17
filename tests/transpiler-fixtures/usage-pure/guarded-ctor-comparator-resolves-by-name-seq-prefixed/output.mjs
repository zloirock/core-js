import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
export function seqPrefixed(c, n) {
  let M;
  if (c) M = _Map;
  return n++, M === _Map ? _Map$groupBy : M.groupBy;
}