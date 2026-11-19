import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A conditional forwarder preserves the source optional chain boundary.
// The sealed value throws at the following property read before evaluating the argument.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = (_ref = (forward?.()?.window).Array, _ref === Array ? _Array$of(observe()) : _ref.of(observe()));