import _globalThis from "@core-js/pure/actual/global-this";
// A retained effectful realm mutation still invalidates the matching constructor claim.
// The later constructor read uses the source replacement.
let e = 0;
_globalThis[e++, 'self'].Set = function () {};
const s = new Set([1]);
export { s };