import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
let a;
[, {
  a
}] = ["skip", {
  a: [1, 2, 3]
}];
_atMaybeArray(a).call(a, -1);