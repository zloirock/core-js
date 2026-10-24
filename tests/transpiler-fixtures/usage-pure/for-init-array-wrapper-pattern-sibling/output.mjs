import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// The initializer evaluates whole before any method is read. Pattern elements then read in
// source order: the first element's methods precede the next element's property getter.
export function sibling(receiver, effect) {
  for (let [, _ref] = [receiver, effect()], values = _values(receiver.w), at = _at(receiver.y), {
      z
    } = _ref;;) return [values, at, z];
}