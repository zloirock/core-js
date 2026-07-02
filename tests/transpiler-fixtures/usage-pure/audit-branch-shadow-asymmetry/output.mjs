import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// shadow asymmetry: bare `Array` shadowed by a function param, but `globalThis.Array`
// reaches the real global through the proxy chain. only the member branch should
// resolve. companion `g` covers the unshadowed case where both branches are viable
function f(Array, {
  from
} = cond ? Array : {
  from: _Array$from
}) {
  return from([1]);
}
// confirm the symmetric case where bare Array is unshadowed: both branches viable,
// synth-swap rewrites both to the same polyfill literal
function g({
  of
} = cond ? {
  of: _Array$of
} : {
  of: _Array$of
}) {
  return of(1, 2);
}
export { f, g };