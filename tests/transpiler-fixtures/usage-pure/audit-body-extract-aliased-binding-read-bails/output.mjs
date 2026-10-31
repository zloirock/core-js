// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function make({
  from: alias,
  dup = alias,
  ...rest
} = Array) {
  return [alias([1]), dup, rest];
}
make();