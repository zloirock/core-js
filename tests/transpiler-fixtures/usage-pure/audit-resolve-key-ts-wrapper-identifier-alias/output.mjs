import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `resolveKey` must peel TS wrappers on entry so `(k) as any` / `(k) satisfies X` / `k!`
// wrapping a computed-key alias still reaches the Identifier alias-follow branch
const arr = [1, 2, 3];
const k = 'at';
_atMaybeArray(arr).call(arr, 0);