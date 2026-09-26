// Each nested claim keeps its source position when an earlier claim consumes a hop.
export function read(box, effect) {
  const [{ w: { values }, y: { at } }] = [box, effect()];
  return [values, at];
}
