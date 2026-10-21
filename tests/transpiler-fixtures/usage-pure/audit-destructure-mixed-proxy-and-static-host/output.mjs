import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const wrapper = {
  a: Object
};
const {
  a: {
    entries
  }
} = wrapper;
const arr = from('hi');
const pairs = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, 'h');
_atMaybeArray(pairs).call(pairs, 0);