import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = {
  a: {
    b: {
      c: Array
    }
  }
};
const {
  a: {
    b: {
      c: {
        from
      }
    }
  }
} = wrapper;
const arr = from('xyz');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'y');
_copyWithinMaybeArray(arr).call(arr, 0, 1);