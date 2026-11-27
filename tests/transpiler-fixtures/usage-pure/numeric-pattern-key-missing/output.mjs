import _globalThis from "@core-js/pure/actual/global-this";
// An unresolved numeric slot keeps the runtime owner of Array.from.
const otherSlot = {
  1: _globalThis
};
const {
  0: missing
} = otherSlot;
export const kept = missing.Array.from([1]);