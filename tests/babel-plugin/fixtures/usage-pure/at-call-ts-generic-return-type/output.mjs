var _ref;
import _at from "@core-js/pure/actual/array/at";
function identity<T>(x: T): T {
  return x;
}
_at(_ref = identity([1, 2, 3])).call(_ref, -1);