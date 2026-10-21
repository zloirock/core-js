// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
export function captured(effect) {
  let held;
  const [{ Array: { prototype: { at } }, Object: { keys }, other }] = [held = (effect(), globalThis)];
  return [at, keys, other, held];
}
export function following(effect) {
  const { Array: { from } } = globalThis, { [(effect(), 'flat')]: flat } = Array.prototype;
  return [from, flat];
}
