import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// array-pattern rest binding `...rest` followed by an instance call: `rest` is always
// an array, so the rewrite picks the array-specific pure-mode instance polyfill.
const [...rest] = [1, 2, 3];
_atMaybeArray(rest).call(rest, 0);