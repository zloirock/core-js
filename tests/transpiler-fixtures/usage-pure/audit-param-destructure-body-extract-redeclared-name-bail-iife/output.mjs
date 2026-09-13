import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
(function run({
  from,
  ...rest
} = Array) {
  var from = 7;
  return [from, rest];
})();
(function make({
  of: of_,
  x: a
} = {
  of: _Array$of,
  x: Array.x
}) {
  function of_() {}
  return [of_, a];
})();
(function keep({
  resolve,
  ...rest
} = _Promise) {
  function inner() {
    var resolve = 1;
    return resolve;
  }
  return [resolve, rest, inner];
})();