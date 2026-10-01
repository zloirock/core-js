import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// The initializer evaluates whole before any method is read. Pattern elements then read in
// source order: the first element's methods precede the next element's property getter.
export function sibling(receiver, effect) {
  for (let [_ref, _ref2] = [receiver, effect()], values = _values(_ref.w), at = _at(_ref.y), {
      z
    } = _ref2;;) return [values, at, z];
}