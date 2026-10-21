import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = {
  a: {
    b: Array
  }
};
const {
  a: {
    b: {
      from
    }
  }
} = wrapper;
const arr = from('xy');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');
_copyWithinMaybeArray(arr).call(arr, 0, 1);