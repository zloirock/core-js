// A call supplies the element once, before its neighbour. Each extracted method reads
// that captured element after every initializer has evaluated.
export function opaque(make, effect) {
  for (let [{ w: { values }, y: { at } }] = [make(), effect()]; ;) return [values, at];
}
