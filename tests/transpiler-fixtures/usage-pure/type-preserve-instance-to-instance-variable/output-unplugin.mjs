import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = _Array$from([1]); const arr2 = _concatMaybeArray(arr).call(arr, [2]); _atMaybeArray(arr2).call(arr2, -1);