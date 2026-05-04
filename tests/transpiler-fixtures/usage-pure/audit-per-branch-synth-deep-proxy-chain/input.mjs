// deep proxy-global chains in both fallback branches: globalThis.self.Array and
// self.window.Array each walk multiple alias hops before resolving to the Array
// static target. markSynthReceiverSkipped must walk down every MemberExpression
// link and mark each intermediate Identifier (`globalThis`, `self`, `window`) so
// none of them queue a parallel polyfill transform during traversal that would
// compose-conflict with the synth-swap receiver-span overwrite. distinct keys per
// branch surface per-key dispatch boundaries
function f({ from } = cond ? globalThis.self.Array : self.window.Array) {
  return from([1]);
}
function g({ of } = cond ? globalThis.self.Array : self.window.Array) {
  return of(7, 8);
}
export { f, g };
