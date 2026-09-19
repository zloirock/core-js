// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function run({
  from: arr,
  ...rest
} = Array) {
  return [arr([1]), rest];
})();
(function emit({
  of: arrOf,
  ...rest
} = Array) {
  return [arrOf(2, 3), rest];
})();