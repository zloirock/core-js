import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function f({
  from: _unused,
  ...rest
} = _self.Array) {
  let from = _Array$from;
  return from([1]);
}
f();