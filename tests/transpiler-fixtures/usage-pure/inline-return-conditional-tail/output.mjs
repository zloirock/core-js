import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// The continuation stays inside the conditional call's short circuit.
// Neither the static argument nor the following computed read runs when the callee is absent.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = (_ref = forward?.().window.Array, null == _ref ? void 0 : (_ref === Array ? _Array$of(observe()) : _ref.of(observe()))[observeKey()]);