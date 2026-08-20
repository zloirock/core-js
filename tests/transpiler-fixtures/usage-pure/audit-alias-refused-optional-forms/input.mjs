// optional member forms of a REFUSED alias: the read gets the runtime ctor guard whose raw
// branch keeps the optional member - a nullish alias short-circuits to undefined, a taken
// path reads the pure static via the guard. optional-CALL forms stay raw entirely (their
// short-circuit cannot be reproduced inside the callee slot)
function t(c) {
  let M;
  if (c) ({ Map: M } = globalThis);
  const read = typeof M?.groupBy;
  const optCall = M?.groupBy?.([1], x => x);
  const mixedCall = M.groupBy?.([2], x => x);
  const unguardable = M?.groupBy([3], x => x);
  return [read, optCall, mixedCall, unguardable];
}
export const r = t(true);
