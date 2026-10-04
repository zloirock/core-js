import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Each nested claim keeps its source position when an earlier claim consumes a hop.
export function read(box, effect) {
  box;
  effect();
  const values = _values(box.w);
  const at = _at(box.y);
  return [values, at];
}