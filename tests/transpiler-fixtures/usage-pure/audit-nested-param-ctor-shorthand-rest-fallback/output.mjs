import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function withRest({
  Array: {
    from
  },
  Set: _unused,
  ...rest
} = _globalThis) {
  let Set = _Set;
  return [from, Set, rest];
}
withRest();