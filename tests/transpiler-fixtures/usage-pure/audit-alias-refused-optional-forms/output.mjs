import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Exported readers retain unknown callers beside the closed example calls below.
// An uncertain alias keeps its nullish member and call boundaries around the identity guard.
// A matching constructor uses its narrow static; other values retain their own method and receiver.
export function t(c) {
  let M;
  if (c) M = _Map;
  const read = typeof (M === _Map ? _Map$groupBy : M?.groupBy);
  const optCall = null == M ? void 0 : M === _Map ? _Map$groupBy([1], x => x) : M.groupBy?.([1], x => x);
  const mixedCall = M === _Map ? _Map$groupBy([2], x => x) : M.groupBy?.([2], x => x);
  const unguardable = null == M ? void 0 : M === _Map ? _Map$groupBy([3], x => x) : M.groupBy([3], x => x);
  return [read, optCall, mixedCall, unguardable];
}
export const r = t(true);