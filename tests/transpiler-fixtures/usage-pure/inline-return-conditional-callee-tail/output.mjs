import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A mutable local callee is read directly between an optional guard and its call.
// Retaining the returned container's static and instance claims must preserve that guard.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = forward == null ? void 0 : _at(_ref = (_ref2 = forward().window.Array, _ref2 === Array ? _Array$of(observe()) : _ref2.of(observe()))).call(_ref, 0);