// Capturing an instance leaf keeps outer static siblings live.
// A preceding declarator rewrite must also preserve a queued computed read.
export function captured(effect) {
  let held;
  const [{ Array: { prototype: { at } }, Object: { keys }, other }] = [held = (effect(), globalThis)];
  return [at, keys, other, held];
}
export function following(effect) {
  const { Array: { from } } = globalThis, { [(effect(), 'flat')]: flat } = Array.prototype;
  return [from, flat];
}
