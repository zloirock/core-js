// validation: a number passed inside `include` together with a `shouldInjectPolyfill`
// callback must still surface the type-mismatch error from the include validation.
'str'.at(-1);
