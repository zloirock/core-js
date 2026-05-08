import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// nested proxy-global destructure `const {window: {Array}} = globalThis` must walk
// through proxy-global keys (`window`, `self`, ...) so the leaf `Array` binding still
// registers as the global; otherwise downstream `Array.from(...)` loses its narrow
const {
  window: {
    Array
  }
} = _globalThis;
const arr = _Array$from([1, 2, 3]);
const head = _atMaybeArray(arr).call(arr, 0);
export { head };