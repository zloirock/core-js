import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Array wrapper neighbours evaluate before the nested methods are read. The loop head
// keeps that evaluation and extracts each method in property order from the paired receiver.
export function trailing(receiver, effect) {
  for (let [,] = [receiver, effect()], values = _values(receiver.w), at = _at(receiver.y);;) return [values, at];
}