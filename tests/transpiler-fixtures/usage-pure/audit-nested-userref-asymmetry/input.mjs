// user declares `_ref` inside a nested function - not visible at module top-level.
// babel's `scope.hasBinding('_ref')` at program scope returns false for nested bindings.
// unplugin's `collectAllBindingNames` walks all scopes blindly, reserving nested names
// at module level. verify both plugins produce the same output layer regardless
function inner() {
  var _ref = 'user';
  return _ref;
}
[1, 2, 3].at(0);
inner();
