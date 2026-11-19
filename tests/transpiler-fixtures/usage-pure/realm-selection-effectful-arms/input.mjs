// A selection every arm of which yields the realm names the realm, effectful arms included: the claim
// above it takes its pure entry and the selection runs once ahead as an effect. An arm that may yield
// another object keeps the identity guard.
let e = 0;
const c = pick();
const user = make();
export const viaAlternate = (c ? globalThis : (e++, self)).Promise.any;
export const viaBoth = (c ? (e++, globalThis) : (e--, self)).Map.groupBy;
export const viaCall = (c ? (e++, globalThis) : globalThis).Array.from([1]);
export const viaCtor = (c ? (e++, self) : globalThis).WeakMap;
export const keepsUserArm = (c ? (e++, globalThis) : user).Object.fromEntries;
export { e };
