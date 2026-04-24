import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// compound assignment `_ref += 1` isn't covered by the `node.operator === '='` check in
// `collectAllBindingNames`, so `_ref` doesn't reach `names` and isn't reserved. if plugin
// needs `_ref` for a memoization, it picks `_ref` and its `_ref = [1,2,3]` assignment
// clobbers whatever `_ref` was before the compound operation. babel has a separate guard
// via `program.globals` for sloppy globals, but unplugin would silently collide
_globalThis._ref = 1;
_ref += 10;
console.log(_ref);
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);