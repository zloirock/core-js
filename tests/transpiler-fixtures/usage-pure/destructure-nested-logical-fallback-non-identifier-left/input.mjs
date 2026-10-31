// a nested destructure over a `||` / `??` init reaches the proxy on EITHER operand whatever the
// left spells: a member, a call and a nullish test hand the read to the global fallback exactly as
// a bare identifier left does, so the static under the proxy is a polyfill candidate in each
// one static per row, so every row is observable by its own module
const { Array: { from: viaMember } } = obj.p || globalThis;
export const a = viaMember([1]);
const { Array: { of: viaNullish } } = obj.p ?? globalThis;
export const b = viaNullish(2);
const { Array: { fromAsync: viaCall } } = mk() || globalThis;
export const c = viaCall([3]);
// control: the identifier left the recogniser always saw
const { Map: { groupBy: viaIdentifier } } = m || globalThis;
export const d = viaIdentifier([4], x => x);
