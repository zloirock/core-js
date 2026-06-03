import _globalThis from "@core-js/pure/actual/global-this";
// the nested-block-hoisted proxy-global alias is reassigned inside a NESTED closure that does not
// re-bind it - a closure write still mutates the outer var, so `M.Array.from` must NOT be polyfilled
// (the reassignment scan descends into non-shadowing nested scopes). matches babel's constantViolations
function f() {
  if (c) {
    var M = _globalThis;
  }
  function g() {
    M = somethingElse;
  }
  M.Array.from([1]);
}