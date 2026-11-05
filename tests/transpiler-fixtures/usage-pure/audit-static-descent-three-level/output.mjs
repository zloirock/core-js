import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Three literal-object levels preserve the native static from read.
// The result still narrows subsequent at, includes and copyWithin calls to array helpers.
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