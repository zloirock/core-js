import _globalThis from "@core-js/pure/actual/global-this";
// Mirrorable mixed defaults bind constructor ponyfills beside nested native reads.
// A declined mirror permits only a proven body extraction, never parameter leaf defaults.
// Wrappers and parameter-scope uses must preserve the same constructor choice.
export const unresolvableKey = (({
  Set,
  Array: {
    from
  },
  [getKey()]: y
} = _globalThis) => [Set, from, y])();