// A captured realm element keeps its store, instance receiver and residual sibling.
// Its supported Object.keys claim and a later independent Array.from claim are both served.
export function captured(effect) {
  let held;
  const [{ Array: { prototype: { at } }, Object: { keys }, other }] = [held = (effect(), globalThis)];
  return [at, keys, other, held];
}
export function following(effect) {
  const { Array: { from } } = globalThis, { [(effect(), 'flat')]: flat } = Array.prototype;
  return [from, flat];
}
