import _globalThis from "@core-js/pure/actual/global-this";
export const restSibling = (({
  Set: S2,
  Array: {
    of: of2
  },
  ...rest
} = _globalThis) => [S2, of2, rest])();