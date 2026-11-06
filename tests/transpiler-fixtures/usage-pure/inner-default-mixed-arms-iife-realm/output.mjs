import _globalThis from "@core-js/pure/actual/global-this";
// A defined realm element makes the IIFE's receiver default dead.
// The literal-array pattern retains its native constructor and static reads.
export const iifeRealm = (([{
  Set: S,
  Array: {
    of
  }
} = _globalThis]) => [S, of(7)])([_globalThis]);