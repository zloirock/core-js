import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Nested array wrappers preserve their positions. Neighbour effects run before
// the nested receiver is read, and each method dispatch uses the inner element.
export function nested(receiver, effect) {
  for (let [[,]] = [[receiver], effect()], values = _values(receiver.w), at = _at(receiver.y);;) return [values, at];
}