import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TSNonNullExpression on a computed-key alias (`k!`) without outer parens
const arr = [1, 2, 3];
const k: 'at' | undefined = 'at';
_atMaybeArray(arr).call(arr, 0);