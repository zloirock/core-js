var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function identity<T>(x: T): T {
  return x;
}
_atMaybeArray(_ref = identity([1, 2, 3])).call(_ref, -1);