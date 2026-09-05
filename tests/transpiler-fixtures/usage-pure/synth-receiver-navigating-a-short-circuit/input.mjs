// a synth-swap receiver whose navigation SHORT-CIRCUITS: the mirror supplants the whole nav, so the
// kept-nav render must stand down on it rather than claim the same span, and a key the mirror leaves
// unpolyfilled must re-read through a SUBSTITUTED root - a raw global there is the ReferenceError
// the substitution exists to prevent. the last row is the boundary: no polyfillable root, stays raw
export function overAHop({ of, from } = globalThis.window?.self.Array) {
  return [of, from];
}
export function unpolyfilledSibling({ groupBy, other } = globalThis.window?.Map) {
  return [groupBy, other];
}
export const viaIifeArgument = (({ entries, other }) => [entries, other])(globalThis.window?.self.Object);
// the two rows the sealed render does NOT take: the guarded hop sits directly under the leaf, so the
// unpolyfilled key re-reads through the chain itself - which is where the root has to be substituted
// by hand, or a raw global reaches the output
export function directlyUnderTheGuard({ of, other } = globalThis.window?.Array) {
  return [of, other];
}
export const viaIifeUnderTheGuard = (({ of, other }) => [of, other])(globalThis.window?.Array);
export function foreignRoot({ of, other } = host.thing?.Array) {
  return [of, other];
}
