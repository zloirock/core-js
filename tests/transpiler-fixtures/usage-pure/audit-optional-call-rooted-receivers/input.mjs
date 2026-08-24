// a `?.()` that IS the receiver's root segment memoizes AS WRITTEN - the sole short-circuit
// is the callee value itself, so the memo carries the source spelling and the dispatch
// guards on it (no disjunct unfold). an ARGFUL callee memoizes through a ref (the claim
// must not drop to raw - the bail here once lost the polyfill outright)
export const r1 = getArr?.()?.flat();
export const r2 = box.get?.()?.flat();
export const r3 = box.inner.get?.()?.flat();
export const r4 = pick(1)?.()?.flat();
export const r5 = pick(2)?.().flat?.();
// a REWRITTEN dispatch callee still threads its disjuncts (its guard joins the chain)
export const r6 = arr.flat?.()?.flat();
use(r1, r2, r3, r4, r5, r6);
