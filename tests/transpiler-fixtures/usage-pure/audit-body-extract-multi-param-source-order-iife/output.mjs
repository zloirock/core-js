import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function run({
  from: _unused,
  ...rest1
} = Array, {
  keys: _unused2,
  ...rest2
} = Object) {
  let from = _Array$from;
  let keys = _Object$keys;
  return [from([1]), keys({}), rest1, rest2];
})();