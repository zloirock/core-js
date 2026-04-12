import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = _Array$from([1]);
_atMaybeArray(arr).call(arr, -1);