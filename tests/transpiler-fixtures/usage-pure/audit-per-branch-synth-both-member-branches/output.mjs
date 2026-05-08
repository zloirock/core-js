import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// both conditional fallback branches are proxy-global member chains rooted in different
// globals (`globalThis.Array`, `self.Array`). both must resolve symmetrically and rewrite
// to the same polyfill literal; intermediate identifier visits must not race with that
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Array$from
}) {
  return from([1]);
}
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