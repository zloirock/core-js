// a chain assignment inside a ternary branch still marks the destructured leaf: the runtime
// may yield the assigned global on that path, so the static must be injected
let c1 = Math.random() < 0.5;
let q;
let x1 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = c1 ? (q = globalThis) : x1;
export const viaChainAssign = iterFrom([1].values());

// a chain assignment wrapping a logical fallback injects through the right operand too
let c2 = Math.random() < 0.5;
let w, m = null;
let x2 = { Array: { from: v => v } };
const { Array: { from: arrayFrom } } = c2 ? (w = (m || globalThis)) : x2;
export const viaChainLogical = arrayFrom([1, 2]);
