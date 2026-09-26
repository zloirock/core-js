import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A conditional forwarder preserves the source optional chain boundary.
// The continuous chain skips the static call and its argument when the callee is absent.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = (_ref = forward?.().window.Array, null == _ref ? void 0 : _ref === Array ? _Array$of(observe()) : _ref.of(observe()));