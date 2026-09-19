import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Nested array wrappers preserve their positional captures. Neighbour effects run before
// the nested receiver is read, and each method dispatch uses the inner element.
export function nested(receiver, effect) {
  for (let [[_ref]] = [[receiver], effect()], _ref2 = _ref, values = _values(_ref2.w), at = _at(_ref2.y);;) return [values, at];
}