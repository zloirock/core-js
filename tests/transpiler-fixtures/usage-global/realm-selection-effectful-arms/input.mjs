// In usage-global a realm selection with effectful arms stays as written, its effects run natively, and
// the constructor read off it injects that constructor's family.
let e = 0;
const c = pick();
const user = make();
export const viaAlternate = (c ? globalThis : (e++, self)).Promise.any;
export const viaBoth = (c ? (e++, globalThis) : (e--, self)).Map.groupBy;
export const viaCall = (c ? (e++, globalThis) : globalThis).Array.from([1]);
export const viaCtor = (c ? (e++, self) : globalThis).WeakMap;
export const keepsUserArm = (c ? (e++, globalThis) : user).Object.fromEntries;
export { e };
