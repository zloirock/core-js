// `var X = X` self-reference normally lets the resolver treat the binding as the global
// of the same name. but if the user reassigns the binding before the use site
// (`Promise = mock`), the subsequent reads MUST NOT route through the polyfill - that
// would silently ignore the reassignment. `createSelfRefVarGuard` now rejects bindings
// with `constantViolations`, so the post-mutation `Promise.try(...)` stays untouched
function f() {
  var Promise = Promise;
  Promise = mock;
  Promise.try(() => 1);
}