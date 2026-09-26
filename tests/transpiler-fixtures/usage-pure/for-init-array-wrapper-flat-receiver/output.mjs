import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Several flat claims dispatch on the paired element, even when an effect keeps its wrapper.
// A memo of the surrounding array would select array methods instead of the receiver's own ones.
export function flat(receiver, effect) {
  for (let [_ref] = [receiver, effect()], values = _values(_ref), at = _at(_ref);;) return [values, at];
}