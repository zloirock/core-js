// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function run({
  from,
  ...rest
} = Array) {
  return [from([1]), rest];
})();
(function emit({
  of,
  ...rest
} = Array) {
  return [of(2, 3), rest];
})();