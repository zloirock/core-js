// conditional branches with mixed Identifier and MemberExpression receivers
// (`cond ? Array : globalThis.Array`) both go through `isViableBranchForKey`. the
// MemberExpression branch resolves through `resolveObjectName` (proxy-global member
// chain `globalThis.Array` -> 'Array' static), and synth-swap rewrites both branches
// symmetrically to the same polyfill literal. drops `_globalThis` import that the
// Identifier-only branch path used to leave behind (side-channel `globalThis` rewrite).
// distinct keys per declaration (`from` vs `of`) make per-key dispatch visible
function f({ from } = cond ? Array : globalThis.Array) {
  return from([1]);
}
function g({ of } = cond ? Array : globalThis.Array) {
  return of(1, 2);
}
export { f, g };
