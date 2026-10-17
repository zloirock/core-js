// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function g({ of, dflt = of, ...rest } = Array) {
  return [of, dflt, rest];
}
g();
