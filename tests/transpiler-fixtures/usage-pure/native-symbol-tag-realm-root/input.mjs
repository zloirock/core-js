// A native well-known symbol leaves its realm root available for substitution.
export const r = list[globalThis.Symbol.toStringTag];
