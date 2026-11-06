// Optional realm navigation supplies static polyfills while supplied arguments retain their nullish branch.
// Unpolyfilled sibling keys read through a substituted realm root on the live branch.
// Parameter defaults synthesize covered keys even when the optional host is absent.
// A receiver rooted in an unknown host keeps its original navigation.
export function overAHop({ of, from } = globalThis.window?.self.Array) {
  return [of, from];
}
export function unpolyfilledSibling({ groupBy, other } = globalThis.window?.Map) {
  return [groupBy, other];
}
export const viaIifeArgument = (({ entries, other }) => [entries, other])(globalThis.window?.self.Object);
// The guard can sit directly below the constructor. The supplied argument retains its nullish branch,
// while the parameter default still reads its unresolved sibling through the optional receiver.
export function directlyUnderTheGuard({ of, other } = globalThis.window?.Array) {
  return [of, other];
}
export const viaIifeUnderTheGuard = (({ of, other }) => [of, other])(globalThis.window?.Array);
export function foreignRoot({ of, other } = host.thing?.Array) {
  return [of, other];
}
