// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function run({ from, ...rest } = Array) {
  return from([1]);
}
run();
