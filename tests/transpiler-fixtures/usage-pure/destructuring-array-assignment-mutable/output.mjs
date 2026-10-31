import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
let x;
[x] = [['hello']];
_atMaybeArray(x).call(x, 0);