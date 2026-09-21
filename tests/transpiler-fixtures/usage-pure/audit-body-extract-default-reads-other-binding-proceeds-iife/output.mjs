import _Array$of from "@core-js/pure/actual/array/of";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const seed = [0];
(function g({
  of: _unused,
  dflt = seed,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of, dflt, rest];
})();