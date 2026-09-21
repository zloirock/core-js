// Every selected receiver keeps its own instance methods beside the constructor arm.
// Unknown arrays and strings both remain possible when no caller type is known.
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
