// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
const arr = [1];

// the value's sequence prefix is copied verbatim, so the calls in it stay polyfilled
export const prefixInstance = (q = (arr.at(0), globalThis).self.window).Map.name;
