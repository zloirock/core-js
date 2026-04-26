// validation: a `shouldInjectPolyfill` callback that throws must surface the user error
// wrapped with plugin context, not crash the whole pipeline.
import 'core-js/actual/array/at';
