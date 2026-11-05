import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Two literal-object levels retain their native static read.
// The known Array.from result still narrows the later at, includes and copyWithin calls.
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