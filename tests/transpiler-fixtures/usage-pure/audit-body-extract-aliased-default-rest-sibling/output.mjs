import _Array$from from "@core-js/pure/actual/array/from";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function run({
  from: _unused,
  ...rest
} = Array) {
  let alias = _Array$from;
  return [alias, rest];
}
run();