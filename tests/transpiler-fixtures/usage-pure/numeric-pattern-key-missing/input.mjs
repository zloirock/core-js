// An unresolved numeric slot keeps the runtime owner of Array.from.
const otherSlot = { 1: globalThis };
const { 0: missing } = otherSlot;
export const kept = missing.Array.from([1]);
