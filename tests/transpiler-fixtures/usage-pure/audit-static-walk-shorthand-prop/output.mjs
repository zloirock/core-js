import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const Array = _globalThis.Array;
const wrapper = {
  Array
};
const {
  Array: {
    from
  }
} = wrapper;
_atMaybeArray(_ref = from(['x'])).call(_ref, 0);