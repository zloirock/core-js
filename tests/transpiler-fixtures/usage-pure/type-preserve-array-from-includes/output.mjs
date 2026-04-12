import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const arr = _Array$from([1]);
_includesMaybeArray(arr).call(arr, 2);