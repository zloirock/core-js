import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const customFromFn = () => [9];
const customOfFn = () => [9];
(function f({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return [from([1]), rest];
})();
(function g({
  of: _unused2,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of(2), rest];
})();