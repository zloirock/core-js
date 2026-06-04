import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// two sibling-block `var` re-declarations: only the LAST one before the use is the reaching write,
// so the receiver narrows to the array of the second redecl, not the string of the first
function g() {
  var x = [];
  {
    var x = 'a';
  }
  {
    var x = [1];
  }
  _atMaybeArray(x).call(x, 0);
}