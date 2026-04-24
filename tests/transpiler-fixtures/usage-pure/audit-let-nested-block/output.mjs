import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// `let _ref` inside a block is lexically scoped - doesn't hoist. babel's
// program-level `scope.hasBinding('_ref')` won't see it. unplugin's
// `collectAllBindingNames` walks all scopes blindly, registering nested names
// at module level. intentionally asymmetric - reserving over-broadly is safe,
// but let's check both still produce valid polyfill output
{
  let _ref = 'nested';
  console.log(_ref);
}
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);