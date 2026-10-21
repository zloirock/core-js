import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
export const iifeRealm = (([{
  Set: S,
  Array: {
    of
  }
} = _globalThis]) => [S, of(7)])([_globalThis]);