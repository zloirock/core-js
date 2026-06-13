import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// inner-level rest in nested proxy destructure: `{ Array: { from, ...arrRest } }`. arrRest
// gathers all OTHER own keys of Array, the original excludes `from` from arrRest. flattening
// `from` into `from = _Array$from` and dropping `from` from the inner pattern would change
// runtime semantics: `arrRest.from` becomes defined. keep `from: _unused` sentinel in the
// inner pattern so arrRest's exclusion semantic survives. mirrors outer-level rest treatment
const from = _Array$from;
const {
  from: _unused,
  ...arrRest
} = _globalThis.Array;
export { from, arrRest };