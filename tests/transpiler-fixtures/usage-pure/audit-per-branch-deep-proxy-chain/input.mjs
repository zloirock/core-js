// per-branch synth-swap with a deep proxy-global MemberExpression on one branch
// (`globalThis.self.Array`). markSynthReceiverSkipped must walk the entire MemberExpression
// chain so that intermediate `globalThis` and `self` Identifier visits do not race the
// synth-swap with parallel polyfill rewrites. resolveObjectName collapses the chain to
// `Array` and registers per-branch polyfill the same way as a bare identifier branch.
// distinct keys (`from` vs `of`) on separate functions cover per-key dispatch
const cond = true;
function f({ from } = cond ? Array : globalThis.self.Array) {
  return from([1]);
}
function g({ of } = cond ? Array : globalThis.self.Array) {
  return of(2, 3);
}
export { f, g };
