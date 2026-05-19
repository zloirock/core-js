// `shouldInjectPolyfill: null` passes validation symmetric to `undefined`.
// `isEmpty` covers both - conditional-spread (`{ shouldInjectPolyfill: dev ? fn
// : null }`) clears the callback without crashing. without the null acceptance
// the validator would surface a "function, or undefined" error that doesn't
// match the actual contract
Array.from(x);
