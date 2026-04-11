import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const [...rest] = [1, 2, 3];
_atMaybeArray(rest).call(rest, 0);