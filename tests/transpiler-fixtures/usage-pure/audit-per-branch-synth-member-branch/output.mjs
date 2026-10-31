import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// mixed-shape conditional branches: bare `Array` and proxy-global `globalThis.Array`.
// both branches must resolve symmetrically to the same polyfill literal; the side-channel
// `globalThis` rewrite from the identifier branch must not leak into the output
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