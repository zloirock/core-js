import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
export function twoWrites(c) {
  let W;
  if (c) W = _Map;
  if (!c) W = _WeakMap;
  return W === _Map ? _Map$groupBy : W.groupBy;
}