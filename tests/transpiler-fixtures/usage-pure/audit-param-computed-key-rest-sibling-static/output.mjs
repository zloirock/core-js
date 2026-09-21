import _Array$of from "@core-js/pure/actual/array/of";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const k = 'of';
function run({
  [k]: _unused,
  ...rest
} = Array) {
  let make = _Array$of;
  return make([1]) && rest;
}
run();