import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// IIFE with destructured params mixing polyfillable keys (`from`, `of`) and non-polyfillable
// (`isArray`). receiver substitution emits `{ from: _Array$from, of: _Array$of, isArray: R.isArray }`
// so each key routes correctly - polyfill for the polyfillable, native ref for the rest.
// dropping `isArray` would call `undefined` at runtime
(({
  from,
  isArray,
  of
}) => isArray(from([1])) && of(1))({
  from: _Array$from,
  isArray: Array.isArray,
  of: _Array$of
});