import _Map from "@core-js/pure/actual/map/constructor";
// optional member forms of a REFUSED alias stay raw: a nullish alias short-circuits to
// undefined, a taken path reads the swapped ctor's surface natively
function t(c) {
  let M;
  if (c) M = _Map;
  const read = typeof M?.groupBy;
  const optCall = M?.groupBy?.([1], x => x);
  const mixedCall = M.groupBy?.([2], x => x);
  const unguardable = M?.groupBy([3], x => x);
  return [read, optCall, mixedCall, unguardable];
}
export const r = t(true);