import _Array$from from "@core-js/pure/actual/array/from";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function g({
  'from': _unused,
  ...rest
} = Array) {
  let f = _Array$from;
  return [f([1]), rest];
}
g();