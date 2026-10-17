import _Array$from from "@core-js/pure/actual/array/from";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const withMethod = function f({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  class C {
    f() {}
  }
  return [from, rest, C];
}();
export { withMethod };