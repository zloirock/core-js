// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
const seed = [0];
(function g({ of, dflt = seed, ...rest } = Array) {
  return [of, dflt, rest];
})();
