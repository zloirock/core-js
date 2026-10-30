// A later alias assignment cannot narrow an earlier read of the same binding.
// The initialized read selects the well-known symbol; a parameter shadow keeps its own property.
let held;
export const before = held?.toStringTag;
({ Symbol: held } = globalThis);
export const after = held.iterator;
export function shadow(held) {
  return held.isConcatSpreadable;
}
