var _ref;
import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function identity<T>(x: T): T {
  return x;
}
_atInstanceProperty(_ref = identity([1, 2, 3])).call(_ref, -1);