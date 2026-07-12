// a `||` / `??` RIGHT-operand global proxy buried in a ternary branch still marks the
// destructured leaf: the runtime may yield the global on that path, so the static must
// be injected (the left operand stays primary; a proxy left is followed as before)
let c = Math.random() < 0.5;
let m = null;
let x = { Array: { from: v => v } };
const { Array: { from } } = c ? (m || globalThis) : x;
export const viaOrRight = from([1, 2]);

// `??` right fallback in the ternary ALTERNATE marks the leaf the same way
let d = Math.random() < 0.5;
let k = null;
let y = { Object: { groupBy: v => v } };
const { Object: { groupBy } } = d ? y : (k ?? globalThis);
export const viaNullishRight = groupBy([1, 2], v => v % 2);

// both operands non-proxy: no reachable global on the branch, nothing to inject
let e = Math.random() < 0.5;
let p = null;
let q = { Promise: { allSettled: v => v } };
let z = { Promise: { allSettled: v => v } };
const { Promise: { allSettled } } = e ? (p || q) : z;
export const viaNonProxy = allSettled([]);

// NESTED logicals recurse: the innermost right-operand proxy still marks the leaf
let f2 = Math.random() < 0.5;
let m2 = null, k2 = null;
let x2 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = f2 ? (m2 || (k2 ?? globalThis)) : x2;
export const viaNestedRight = iterFrom([1, 2].values());
