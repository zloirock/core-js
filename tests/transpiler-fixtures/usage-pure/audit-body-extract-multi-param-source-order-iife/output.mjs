// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function run({
  from,
  ...rest1
} = Array, {
  keys,
  ...rest2
} = Object) {
  return [from([1]), keys({}), rest1, rest2];
})();