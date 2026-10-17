// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = (q = globalThis.noSuchSlot).Map.name;
