// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function g({
  'from': f,
  ...rest
} = Array) {
  return [f([1]), rest];
}
g();