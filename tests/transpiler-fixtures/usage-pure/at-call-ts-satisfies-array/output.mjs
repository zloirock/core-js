import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2, 3] satisfies number[];
_atMaybeArray(arr).call(arr, -1);