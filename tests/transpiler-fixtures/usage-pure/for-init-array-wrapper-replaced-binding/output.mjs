import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// The wrapper captures the receiver before a neighbour can replace its binding.
// Both nested method reads use that original value after the neighbour's effect.
export function replaced(receiver, other) {
  for (let [_ref] = [receiver, receiver = other], _ref2 = _ref, values = _values(_ref2.w), at = _at(_ref2.y);;) return [values, at];
}