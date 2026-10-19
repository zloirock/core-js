import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an indexed access over `typeof X` reads the object literal X holds: the `keyof` fold of an
// `as const` map is the union of its values, and a literal key reads that one property
const COLORS = {
  red: 'r',
  blue: 'b'
} as const;
type Color = typeof COLORS[keyof typeof COLORS];
export function first(color: Color) {
  return _atMaybeString(color).call(color, 0);
}
const limits = {
  min: [0],
  max: [9]
};
export function hasZero(min: typeof limits['min']) {
  return _includesMaybeArray(min).call(min, 0);
}