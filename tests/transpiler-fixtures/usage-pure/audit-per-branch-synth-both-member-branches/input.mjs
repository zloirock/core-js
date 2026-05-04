// both fallback branches are MemberExpression chains rooted in different proxy
// globals. each branch resolves separately through resolveObjectName, and the
// per-branch synth-swap rewrites both to the same polyfill literal symmetrically.
// the inner globalThis / self / window Identifier visits must be suppressed so they
// don't queue parallel polyfill transforms that compose-conflict with the synth-swap
// receiver-span overwrite. distinct keys per declaration verify per-key dispatch
function f({ from } = cond ? globalThis.Array : self.Array) {
  return from([1]);
}
function g({ of } = cond ? globalThis.Array : self.Array) {
  return of(1, 2);
}
export { f, g };
