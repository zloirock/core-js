import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A const-bound literal wrapper retains its native Array.from read.
// The result type still selects array dispatch for at and includes.
const wrapper = {
  a: Array
};
const {
  a: {
    from
  }
} = wrapper;
const arr = from('hi');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'h');