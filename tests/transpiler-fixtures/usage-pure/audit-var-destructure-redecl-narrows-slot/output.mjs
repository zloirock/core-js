import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a `var` redeclared via a destructure pattern in a nested block (var [x] = ['s']) binds the
// destructured SLOT ('s', a string), not the whole RHS array. the reaching-redecl resolver must
// follow the key-path to the slot, else the array-only at variant dispatches onto a string receiver
var x = [1, 2, 3];
{
  var [x] = ['s'];
}
_atMaybeString(x).call(x, 0);