import _globalThis from "@core-js/pure/actual/global-this";
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
export const iifeHeld = (([{
  Set: S,
  Array: {
    of
  }
} = _globalThis]) => [S, of(7)])([held]);