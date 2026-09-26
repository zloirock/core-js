import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// A call supplies the element once, before its neighbour. Each extracted method reads
// that captured element after every initializer has evaluated.
export function opaque(make, effect) {
  for (let [_ref] = [make(), effect()], _ref2 = _ref, values = _values(_ref2.w), at = _at(_ref2.y);;) return [values, at];
}