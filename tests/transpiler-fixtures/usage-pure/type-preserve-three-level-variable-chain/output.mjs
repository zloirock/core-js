import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
const arr = _Array$from([1]);
const first = _atMaybeArray(arr).call(arr, 0);
_includes(first).call(first, "x");