// Direct selecting receivers serve supported static and instance leaves from one chosen value.
// Nested literal and loop hosts preserve their own instance receiver and native residual boundaries.
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
