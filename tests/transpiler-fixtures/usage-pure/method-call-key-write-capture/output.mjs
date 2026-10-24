import _at from "@core-js/pure/actual/instance/at";
// A key can replace the receiver binding after the member captured its old value.
// The call must keep that original receiver as this, including a non-callable method.
export function read(receiver, replacement, argument) {
  var _ref;
  return _ref = receiver, receiver = replacement, (_at(_ref) || 0).call(_ref, argument());
}