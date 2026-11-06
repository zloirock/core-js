import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const {
  box: {
    Array: BoxArray
  }
} = _globalThis;
const boxed = BoxArray.from([4, 5]);
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
_globalThis.self = {
  Array: BoxArray
};
export { boxed };