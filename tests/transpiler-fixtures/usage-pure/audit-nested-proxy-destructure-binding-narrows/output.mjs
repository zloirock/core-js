import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// nested proxy-global destructure `const {window: {Array}} = globalThis` must walk
// through proxy-global keys (`window`, `self`, ...) so the leaf `Array` binding still
// registers as the global; otherwise downstream `Array.from(...)` loses its narrow
const {
  Array
} = _globalThis;
const arr = _Array$from([1, 2, 3]);
const head = _atMaybeArray(arr).call(arr, 0);
export { head };

// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const {
  box: {
    Array: BoxArray
  }
} = _globalThis;
const boxed = BoxArray.from([4, 5]);
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
_globalThis.self = {
  Array: BoxArray
};
const {
  self: {
    Array: SelfArray
  }
} = _globalThis;
const swapped = SelfArray.from([6]);
export { boxed, swapped };