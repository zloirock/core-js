import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// an indexed access over `typeof X` reads the object literal X holds: the `keyof` fold of an
// `as const` map is the union of its values, and a literal key reads that one property
const COLORS = {
  red: 'r',
  blue: 'b'
} as const;
type Color = typeof COLORS[keyof typeof COLORS];
export function first(color: Color) {
  return color.at(0);
}
const limits = {
  min: [0],
  max: [9]
};
export function hasZero(min: typeof limits['min']) {
  return min.includes(0);
}