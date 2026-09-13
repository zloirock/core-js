// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function withRest({ Array: { from }, Set, ...rest } = globalThis) {
  return [from, Set, rest];
}
withRest();
