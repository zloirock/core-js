import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = {
  ns: Array
};
const {
  ns: {
    from
  },
  x = _flatMaybeArray(_ref = [2]).call(_ref)
} = wrapper;
from([3]);
x;