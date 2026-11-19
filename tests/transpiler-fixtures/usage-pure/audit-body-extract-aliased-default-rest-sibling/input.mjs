// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function run({ from: alias = [], ...rest } = Array) {
  return [alias, rest];
}
run();
