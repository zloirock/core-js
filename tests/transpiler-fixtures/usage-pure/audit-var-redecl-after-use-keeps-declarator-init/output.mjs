import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a nested-block `var` re-declaration that sits AFTER the use does not reach it, so the declarator
// init still describes the receiver - it narrows to the array-specific helper
function g() {
  var x = [1];
  _atMaybeArray(x).call(x, 0);
  {
    var x = 'late';
  }
}