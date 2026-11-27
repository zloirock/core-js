import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// The method inside the initializer must be visited.
enum E {
  A = 1 + 2,
  Extra = _includesMaybeArray(_ref = [7]).call(_ref, 7) ? 1 : 0,
  B = 3 + 4
}
const arr: number[] = [E.A, E.B];
_atMaybeArray(arr).call(arr, 0);