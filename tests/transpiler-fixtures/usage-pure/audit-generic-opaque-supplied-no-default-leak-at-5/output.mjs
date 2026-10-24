import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> {
  v: T;
}
declare const defaultedBox: Box;
_atMaybeArray(_ref = defaultedBox.v).call(_ref, 0);