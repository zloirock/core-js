// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
export function flat(flag, user) {
  const { from, at } = flag ? Array : user;
  return [from, at];
}
export function nested(flag, user) {
  const { w: { from, includes } } = { w: flag ? Array : user };
  return [from, includes];
}
export function loop(flag, user) {
  for (const { from, map } of [flag ? Array : user]) return [from, map];
}
