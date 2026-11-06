// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const customFromFn = () => [9];
const customOfFn = () => [9];
(function f({ from = customFromFn, ...rest } = Array) {
  return [from([1]), rest];
})();
(function g({ of = customOfFn, ...rest } = Array) {
  return [of(2), rest];
})();
