import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested TS wrappers around a computed-key alias - `unwrapParens` must peel all layers
const arr = [1, 2, 3];
const k = 'at';
_atMaybeArray(arr).call(arr, 0);