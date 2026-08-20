import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `interface I<T = string[]>` referenced as bare `I` must apply the default to its members.
// Without default propagation, `obj.x` would stay as raw `T` and the array narrow would be lost.
interface I<T = string[]> {
  x: T;
}
declare const obj: I;
_atMaybeArray(_ref = obj.x).call(_ref, 0);