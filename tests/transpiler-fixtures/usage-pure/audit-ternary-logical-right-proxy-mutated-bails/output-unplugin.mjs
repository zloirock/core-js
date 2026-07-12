import _globalThis from "@core-js/pure/actual/global-this";
// a user-patched static must NOT be substituted on the ternary-buried right-operand proxy
// path: the mutation gate keeps the read live through the pure global object, so the patch
// wins at runtime (the proxy operand maps to the pure root, not to a frozen polyfill)
Array.from = v => v;
let c = Math.random() < 0.5;
let m = null;
let x = { Array: { from: v => v } };
const { Array: { from } } = c ? (m || _globalThis) : x;
export const viaMutated = from([1, 2]);