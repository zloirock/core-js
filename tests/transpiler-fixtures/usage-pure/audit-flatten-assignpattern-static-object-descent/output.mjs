import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = {
  ns: Object
};
const {
  ns: {
    entries
  } = {}
} = wrapper;
const arr = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, ['k', 1]);