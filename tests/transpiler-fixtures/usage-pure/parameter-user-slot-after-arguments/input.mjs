// A user getter runs after all arguments, at the original pattern read.
// A constructor sibling must not pull that read into argument evaluation.
export function read(user, later) {
  return (({ userList: { at }, Map: M }, other) => [at, M, other])(user || globalThis, later());
}
