import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
function wrap<T extends number[]>(x: T): { [K in keyof T]: T[K] } {
  return x;
}
_atMaybeArray(_ref = wrap([1, 2, 3])).call(_ref, 0);