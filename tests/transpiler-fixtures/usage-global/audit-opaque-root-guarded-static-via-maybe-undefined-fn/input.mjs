// NEGATIVE: a MAYBE-undefined callee (conditional assignment) is not provable - the chain
// keeps the raw guarded read off the ref
let mf;
if (globalThis.setTimeout) mf = () => globalThis;
export const viaMaybeUndefinedFn = mf?.()?.window?.self?.Array.of(17).at(0);
