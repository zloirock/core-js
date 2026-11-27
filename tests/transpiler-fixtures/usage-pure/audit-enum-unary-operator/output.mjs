import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// The method inside the initializer must be visited.
enum E {
  A = +1,
  Extra = +_includesMaybeArray(_ref = [7]).call(_ref, 7),
  B = -2,
  C = ~3
}
const arr: number[] = [E.A, E.B, E.C];
_atMaybeArray(arr).call(arr, 0);