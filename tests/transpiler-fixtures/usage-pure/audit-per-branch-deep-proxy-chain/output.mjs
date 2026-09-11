import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// per-branch synth-swap with a deep proxy-global chain `globalThis.self.Array` on one
// branch. the chain must collapse to `Array` and rewrite as a single polyfill literal;
// intermediate `globalThis` / `self` identifiers must not race with parallel rewrites
const cond = true;
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
  return of(2, 3);
}
export { f, g };