// Independent nested reads retain source order and separate repeated getters.
export function read(source, effect) {
  const [{ w: { values }, y: { at } }] = [source, effect()];
  return [values, at];
}
export function repeated(source) {
  const [{ w: { at: first }, w: { at: second } }] = [source];
  return [first, second];
}
