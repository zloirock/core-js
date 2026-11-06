import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Exported readers retain unknown callers beside the closed example calls below.
// optional member forms of a REFUSED alias: the read gets the runtime ctor guard whose raw
// branch keeps the optional member - a nullish alias short-circuits to undefined, a taken
// path reads the pure static via the guard. optional-CALL forms stay raw entirely (their
// short-circuit cannot be reproduced inside the callee slot), so the swapped binding carries
// the static they read: the whole constructor's entry (`map`). the narrow one answered them
// only through the guarded read beside them, whose `map/group-by` sets the static on it
export function t(c) {
  let M;
  if (c) M = _Map;
  const read = typeof (M === _Map ? _Map$groupBy : M?.groupBy);
  const optCall = M?.groupBy?.([1], x => x);
  const mixedCall = M.groupBy?.([2], x => x);
  const unguardable = M?.groupBy([3], x => x);
  return [read, optCall, mixedCall, unguardable];
}
export const r = t(true);