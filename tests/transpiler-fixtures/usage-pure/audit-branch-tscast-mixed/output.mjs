import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// TS-cast wrappers around branches: `(Array as any)` peels through the runtime-transparent
// peel before the branch-viability check runs the Identifier / MemberExpression check.
// mixed Identifier-cast vs MemberExpression-cast branches both viable - synth-swap
// rewrites both to the same polyfill literal. distinct keys per declaration cement which
// import links to which line
function f({
  from
} = cond ? {
  from: _Array$from
} as any : {
  from: _Array$from
} as any) {
  return from([1]);
}
function g({
  of
} = cond ? {
  of: _Array$of
} as any : {
  of: _Array$of
} as any) {
  return of(1, 2);
}
export { f, g };