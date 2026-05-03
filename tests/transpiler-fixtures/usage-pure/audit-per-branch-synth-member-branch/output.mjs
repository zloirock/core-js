import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// conditional branches with mixed Identifier and MemberExpression receivers
// (`cond ? Array : globalThis.Array`) both go through `isViableBranchForKey`. the
// MemberExpression branch resolves through `resolveObjectName` (proxy-global member
// chain `globalThis.Array` -> 'Array' static), and synth-swap rewrites both branches
// symmetrically to the same polyfill literal. drops `_globalThis` import that the
// Identifier-only branch path used to leave behind (side-channel `globalThis` rewrite).
// distinct keys per declaration (`from` vs `of`) make per-key dispatch visible
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