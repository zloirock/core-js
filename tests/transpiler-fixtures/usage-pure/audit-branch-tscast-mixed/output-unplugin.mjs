import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// TS-cast wrappers around branches: `(Array as any)` peels through peelFallbackWrappers
// before isViableBranchForKey runs the Identifier / MemberExpression check. mixed
// Identifier-cast vs MemberExpression-cast branches both viable - synth-swap rewrites
// both to the same polyfill literal. distinct keys per declaration cement which import
// links to which line
function f({ from } = cond ? { from: _Array$from } : { from: _Array$from }) {
  return from([1]);
}
function g({ of } = cond ? { of: _Array$of } : { of: _Array$of }) {
  return of(1, 2);
}
export { f, g };