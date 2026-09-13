import _self from "@core-js/pure/actual/self";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function f({
  from,
  ...rest
} = _self.Array) {
  return [from, rest];
}
f();