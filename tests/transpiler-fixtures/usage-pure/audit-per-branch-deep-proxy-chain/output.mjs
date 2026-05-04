import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// per-branch synth-swap with a deep proxy-global MemberExpression on one branch
// (`globalThis.self.Array`). markSynthReceiverSkipped must walk the entire MemberExpression
// chain so that intermediate `globalThis` and `self` Identifier visits do not race the
// synth-swap with parallel polyfill rewrites. resolveObjectName collapses the chain to
// `Array` and registers per-branch polyfill the same way as a bare identifier branch.
// distinct keys (`from` vs `of`) on separate functions cover per-key dispatch
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