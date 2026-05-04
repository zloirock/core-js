// TS-cast wrappers around branches: `(Array as any)` peels through peelFallbackWrappers
// before isViableBranchForKey runs the Identifier / MemberExpression check. mixed
// Identifier-cast vs MemberExpression-cast branches both viable - synth-swap rewrites
// both to the same polyfill literal. distinct keys per declaration cement which import
// links to which line
function f({ from } = cond ? (Array as any) : (globalThis.Array as any)) {
  return from([1]);
}
function g({ of } = cond ? (Array as any) : (globalThis.Array as any)) {
  return of(1, 2);
}
export { f, g };
