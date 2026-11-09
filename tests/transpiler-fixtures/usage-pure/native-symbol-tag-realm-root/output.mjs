import _globalThis from "@core-js/pure/actual/global-this";
// A native well-known symbol leaves its realm root available for substitution.
export const r = list[_globalThis.Symbol.toStringTag];