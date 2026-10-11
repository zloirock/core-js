// a presence test of a static decides a `||` where the catalogue names the static a method - its `typeof`
// is a function and an `in` test of its key is true once injected - so the right never runs and injects
// nothing. a well-known symbol's `typeof` decides nothing: the right of its `&&` may run, and injects
export const viaTypeof = typeof Array.from == 'function' || Promise.resolve(fallback);
export const viaIn = 'of' in Array || new Map(fallback);
export const viaSymbol = typeof Symbol.asyncIterator == 'symbol' && new Set(fallback);
