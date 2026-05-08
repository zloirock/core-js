import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// 3-level static descent through `wrapper.a.b.c.Array` lifts the constructor leaf.
// Each instance call must narrow precisely so the body-extract alias registers per call site.
const wrapper = {
  a: {
    b: {
      c: Array
    }
  }
};
const from = _Array$from;
const arr = from('xyz');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'y');
_copyWithinMaybeArray(arr).call(arr, 0, 1);