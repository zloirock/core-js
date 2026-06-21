import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body declares a local `var` / `let` binding before the return. local declarations
// shadow free identifiers - inlining the return at the caller would mis-resolve the body's
// free name (`Map` vs caller-scope `Map`), so receiver resolution must bail on a leading
// VariableDeclaration. distinct shapes: `var` / `let` / `const` / function-decl / class-decl
const a = (() => {
  var local = 1;
  return _Map;
})().from([1]);
const b = (() => {
  let local = 1;
  return _Set;
})().of(2);
const c = (() => {
  const local = 1;
  return _Map;
})().of(3);
const d = (() => {
  function local() {}
  return _Set;
})().of(4);
const e = (() => {
  class Local {}
  return _Map;
})().of(5);
export { a, b, c, d, e };