import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
let x = [];
_atMaybeArray(x).call(x, -1);
x = 'hello';