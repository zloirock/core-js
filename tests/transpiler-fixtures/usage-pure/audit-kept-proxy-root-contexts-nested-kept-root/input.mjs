// Kept proxy stores retain the value and nullish guard observed by their consumers.
// These hosts exercise nested stores, defaults, class members, async bodies and
// computed keys. A stored terminal probe must not become an always-defined realm
// value merely because another proxy hop follows the store.
let n;
export const nestedKeptRoot = (n = globalThis.window?.self.window)?.self.Array.prototype.flat.call([1, [2]]);
