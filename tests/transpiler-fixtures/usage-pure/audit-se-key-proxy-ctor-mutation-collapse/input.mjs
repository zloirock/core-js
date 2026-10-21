// A retained effectful realm mutation still invalidates the matching constructor claim.
// The later constructor read uses the source replacement.
let e = 0;
globalThis[(e++, 'self')].Set = function () {};
const s = new Set([1]);
export { s };
