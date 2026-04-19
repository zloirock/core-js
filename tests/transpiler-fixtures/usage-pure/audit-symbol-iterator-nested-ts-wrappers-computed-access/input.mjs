// property-access counterpart of `audit-in-symbol-ts-as-double-wrapper` — unwrapParens
// `while`-loop must peel 2+ levels of TS wrappers inside `resolveComputedSymbolKey`,
// not just one
const iter = obj[((Symbol as any) as any).iterator];
