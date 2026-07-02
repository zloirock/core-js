// validation: a `shouldInjectPolyfill` callback that throws a frozen error object must
// still surface a clear plugin-side error wrapper, not crash on the frozen state.
[].at(0);
