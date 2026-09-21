import _Promise from "@core-js/pure/full/promise";
// A captured constructor selected as a full index supplies its own static reads.
// A same-named parameter still supplies its caller's properties.
consume(_Promise);
const Captured = _Promise;
const {
  all
} = Captured;
export const methods = [all, Captured.race];
export function shadow(Captured) {
  const {
    all
  } = Captured;
  return all;
}