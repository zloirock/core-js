// A conditional receiver keeps the instance sibling's original type.
// The constructor arm supplies its static; a user array still needs instance dispatch.
export function read(flag, user) {
  const [{ from, at }] = [flag ? Array : user];
  return [from, at];
}
