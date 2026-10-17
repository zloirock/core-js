// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
const arr = [1];
export const nonGlobalUnderHop = (q = (arr.at(0), globalThis).noSuchSlot).Map.name;
