import _globalThis from "@core-js/pure/actual/global-this";
// a nested-block-hoisted `var` aliasing a proxy-global, REASSIGNED before use: the alias no longer
// holds the global, so `M.Array.from` is not `Array.from` and must not be polyfilled (resolving it
// would drop the `M` receiver). matches babel's native reassignment (constantViolations) bail
function f() {
  if (c) {
    var M = _globalThis;
  }
  M = somethingElse;
  M.Array.from([1]);
}