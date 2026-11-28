import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
var _ref;
function w<T>(x: T): {
  v: T;
} {
  return {
    v: x
  };
}
_atMaybeArray(_ref = w(_Object$assign([7], {
  a: 1
})).v).call(_ref, 0);