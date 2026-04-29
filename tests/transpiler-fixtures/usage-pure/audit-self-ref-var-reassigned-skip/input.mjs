// `var X = X` self-reference normally lets the resolver treat the binding as the global
// of the same name. When the user reassigns the binding before the use site
// (`Promise = mock`), the subsequent reads stay bound to the user's reassignment rather
// than the polyfill. The self-ref guard rejects bindings that have any subsequent
// mutation, so the post-mutation `Promise.try(...)` is left untouched
function f() {
  var Promise = Promise;
  Promise = mock;
  Promise.try(() => 1);
}
