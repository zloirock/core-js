import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// user declares `_ref` inside a nested function - not visible at module top-level.
// babel's `scope.hasBinding('_ref')` at program scope returns false for nested bindings.
// unplugin's `collectAllBindingNames` walks all scopes blindly, reserving nested names
// at module level. verify both plugins produce the same output layer regardless
function inner() {
  var _ref = 'user';
  return _ref;
}
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);
inner();