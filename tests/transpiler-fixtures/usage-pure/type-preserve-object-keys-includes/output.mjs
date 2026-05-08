import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$keys from "@core-js/pure/actual/object/keys";
const arr = _Object$keys(obj);
_includesMaybeArray(arr).call(arr, "x");