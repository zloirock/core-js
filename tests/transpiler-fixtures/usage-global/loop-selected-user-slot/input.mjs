// Mirroring a selected realm retains the user slot consumed by its
// nested instance claim, including when that claim precedes the constructor.
export function read(user) {
  for (const { userList: { at }, Map: M } of [user || globalThis]) return [at, M];
}
