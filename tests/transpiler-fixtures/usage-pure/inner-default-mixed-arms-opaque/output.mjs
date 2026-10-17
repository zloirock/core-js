import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
// A receiver-bearing default runs only for an undefined source slot. Nested constructor and static claims must share that
// condition and preserve a supplied foreign value.
const held = {
  Set: function HeldSet() {
    return held;
  },
  Array: {
    of: x => [x, 'held']
  }
};
function viaOpaque(slot) {
  const [{
    Set: S,
    Array: {
      of
    }
  } = {
    Set: _Set,
    Array: {
      of: _Array$of
    }
  }] = slot;
  return [S, of(7)];
}
export const opaque = [viaOpaque([]), viaOpaque([held])];