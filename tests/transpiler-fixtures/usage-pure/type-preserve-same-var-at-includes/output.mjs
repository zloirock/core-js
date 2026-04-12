import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const arr = _Array$from(x);
_atMaybeArray(arr).call(arr, -1);
_includesMaybeArray(arr).call(arr, "y");