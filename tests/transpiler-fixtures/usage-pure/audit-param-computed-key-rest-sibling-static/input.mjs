// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const k = 'of';
function run({ [k]: make, ...rest } = Array) {
  return make([1]) && rest;
}
run();
