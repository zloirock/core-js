// the outer chain's own CALL runs in full between the two reads, and its argument can reach the root
// through an iterator or an accessor - another shape whose inner test has to stay put
const seed = [7, 8];
export const spineCallBeforeKey = globalThis.window?.self.Array.from(seed)[globalThis.window?.self.Math.trunc(0.5)];
