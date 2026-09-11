// TS expression wrappers (`as any`) are transparent to chain-receiver substitution; the
// proxy-global leaf still resolves to its polyfill and the inner `?.` deopts where the
// substituted leaf is always-defined. covers chain receiver + outer instance polyfill
export const a = (globalThis as any)?.foo?.includes(1);
export const b = (Promise as any)?.foo?.includes(2);
