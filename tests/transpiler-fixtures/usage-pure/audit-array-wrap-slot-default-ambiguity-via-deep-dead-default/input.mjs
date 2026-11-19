// A defined deeply nested realm element makes its receiver default dead.
// The pattern remains native while the later Iterator use retains its constructor claim.
let deepFb = {};
const [[{ Iterator: I } = deepFb]] = [[globalThis]];
export const viaDeepDeadDefault = I.range(0, 3);
