// `shouldInjectPolyfill: null` passes validation symmetric to `undefined`: both are
// treated as absent, so a conditional-spread (`{ shouldInjectPolyfill: dev ? fn : null }`)
// clears the callback without crashing. without the null acceptance the validator would
// surface a "function, or undefined" error that doesn't match the contract.
Array.from(x);
