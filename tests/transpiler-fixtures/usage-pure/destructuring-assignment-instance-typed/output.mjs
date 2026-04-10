import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
let x;
({
  x
} = {
  x: [1, 2, 3]
});
_atMaybeArray(x).call(x, -1);