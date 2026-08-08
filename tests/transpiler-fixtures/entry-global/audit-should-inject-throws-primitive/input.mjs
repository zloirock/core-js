// validation: a `shouldInjectPolyfill` callback that throws a primitive (not an Error)
// must still produce a clear plugin-side error wrapper, not a bare unhandled throw.
import 'core-js/actual/array/at';
