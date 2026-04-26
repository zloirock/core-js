// validation: a `shouldInjectPolyfill` callback that throws a plain string must still
// surface a clear plugin-side error wrapper, not a bare unhandled throw.
[].at(0);
