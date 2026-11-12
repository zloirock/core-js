// An instance claim beside a mirrored constructor remains covered.
// The user slot is captured once at parameter binding time.
export function read(user) {
  return (({ userList: { at }, Map: M }) => [at, M])(user || globalThis);
}
