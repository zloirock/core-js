import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TSSatisfiesExpression wrapper on a computed-key alias (sibling of `as any`)
const arr = [1, 2, 3];
const k = 'at';
_atMaybeArray(arr).call(arr, 0);