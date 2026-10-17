// a `||` / `??` RIGHT-operand global proxy buried in a ternary branch: the proxy operand is
// synth-swapped per branch (polyfill fires only when the runtime actually yields the global),
// while caller-provided objects on the other paths keep their own methods
let c = Math.random() < 0.5;
let m = null;
let x = { Array: { from: v => v } };
const { Array: { from } } = c ? (m || globalThis) : x;
export const viaOrRight = from([1, 2]);
