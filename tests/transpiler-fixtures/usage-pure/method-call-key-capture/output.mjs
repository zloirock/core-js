import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// The receiver is captured before a computed key, and the lookup precedes arguments.
// A nested claim in the key remains live when the outer call consumes the member.
export function read(getReceiver, key, argument) {
  var _ref, _ref2;
  return _ref = getReceiver(), key(), _includesMaybeArray(_ref2 = ['x']).call(_ref2, 'x'), (_at(_ref) || 0).call(_ref, argument());
}