// A mixed selecting array element supplies one captured receiver for its static and instance leaves.
// The Array.from branch is served without replacing a user branch's own method.
export function read(flag, user) {
  const [{ from, at }] = [flag ? Array : user];
  return [from, at];
}
