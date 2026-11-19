import _Promise from "@core-js/pure/actual/promise";
// A later computed literal key replaces an earlier plain property with the same name.
// The native allSettled read uses the full Promise value stored in that slot.

const withComputed = {
  N: Array,
  ["N"]: _Promise
};
const {
  N: {
    allSettled
  }
} = withComputed;
export const viaComputed = allSettled([]);