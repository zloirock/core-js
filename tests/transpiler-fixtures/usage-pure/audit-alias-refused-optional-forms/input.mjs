// Exported readers retain unknown callers beside the closed example calls below.
// An uncertain alias keeps its nullish member and call boundaries around the identity guard.
// A matching constructor uses its narrow static; other values retain their own method and receiver.
export function t(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  const read = typeof M?.groupBy;
  const optCall = M?.groupBy?.([1], x => x);
  const mixedCall = M.groupBy?.([2], x => x);
  const unguardable = M?.groupBy([3], x => x);
  return [read, optCall, mixedCall, unguardable];
}
export const r = t(true);
