import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
const from = _Array$from;
// Static extracted from a hole-prefixed multi-element ArrayPattern element
// (`const [, { from }] = [Set, Array]`): `from` flattens to `const from = _Array$from` while the
// residual array destructure (the `_Set` slot and the renamed `_unused` key) survives. downstream
// `arr.at(0)` narrows to the Array-typed instance polyfill via the registered extraction alias
const [, {
  from: _unused
}] = [_Set, Array];
const arr = from([1, 2, 3]);
_atMaybeArray(arr).call(arr, 0);