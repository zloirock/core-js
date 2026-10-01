import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Nested array wrappers preserve their positional captures. Neighbour effects run before
// the nested receiver is read, and each method dispatch uses the inner element.
export function nested(receiver, effect) {
  for (let [[_ref]] = [[receiver], effect()], values = _values(_ref.w), at = _at(_ref.y);;) return [values, at];
}