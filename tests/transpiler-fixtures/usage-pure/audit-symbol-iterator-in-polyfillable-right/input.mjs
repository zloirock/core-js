// `Symbol.iterator in X` when X itself contains a polyfillable call. the outer rewrite
// wraps the whole expression in the is-iterable check, and the inner `Array.from(src)`
// inside the RHS still gets polyfilled independently - two composed transforms land
// cleanly without one eliminating the other
Symbol.iterator in Array.from(src);
