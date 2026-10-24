// NESTED logicals recurse: the innermost right-operand proxy is the one synth-swapped
let f2 = Math.random() < 0.5;
let m2 = null, k2 = null;
let x2 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = f2 ? (m2 || (k2 ?? globalThis)) : x2;
export const viaNestedRight = iterFrom([1, 2].values());
