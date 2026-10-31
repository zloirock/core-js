// the `?.` over the store is DEAD for a claim above too: the store hands the always-defined
// ponyfill on, so the instance dispatch takes its receiver plain instead of memoizing a guard
let g6, w6;
export const deadOptionalClaim = (g6 = globalThis, w6 = g6.self)?.Array.prototype.at;
