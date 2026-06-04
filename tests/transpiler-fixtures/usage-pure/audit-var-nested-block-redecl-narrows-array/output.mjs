import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// reverse direction: the function-scoped declarator init is a string, but a nested-block `var`
// re-declaration makes the receiver an array at the use. the reaching re-declaration flows through,
// narrowing to the array-specific helper
function g() {
  var x = 's';
  {
    var x = [1];
  }
  _atMaybeArray(x).call(x, 0);
}