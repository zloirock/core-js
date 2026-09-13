import _Promise from "@core-js/pure/actual/promise/constructor";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function f({
  from,
  ...r1
} = Array, {
  keys,
  ...r2
} = Object, {
  resolve,
  ...r3
} = _Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();