// a receiver carrying its OWN live `?.` short-circuits the whole chain at that link, so the
// combined dispatch tests the link's object before the maybe-helper reads the receiver past it;
// a receiver that comes out nullish below the link still throws at that read, as native does
export function twoLive(a) {
  return a?.b?.c.flat?.().map(x => x).length;
}
// the live `?.` may sit deeper than the root, with the root itself plain
export function deeperSeated(a) {
  return a.b?.c.flat?.().map(x => x).length;
}
// an optional CALL inside the receiver short-circuits the same way
export function callMid(a) {
  return a?.get?.().rows.flat?.().filter?.(Boolean).length;
}
// NEGATIVE: parens TERMINATE the chain - the sealed `?.` no longer short-circuits what
// follows, so the receiver keeps its testless form and throws like native
export function parenSealed(a) {
  return (a?.b).c.flat?.().map(x => x).length;
}
// NEGATIVE: no live `?.` in the receiver - the helper's own member read must throw
export function plainReceiver(arr) {
  return arr.flat?.().map(x => x).length;
}
// the same link rule on the NON-polyfilled inner path: the link is tested and the method is
// read plainly off the receiver memo, so a nullish receiver throws there as the source does
export function nonPolyInner(o) {
  return o?.b.c.notPolyfilled?.().map(x => x).length;
}
// a computed non-polyfilled inner keeps the bracket read under the same short-circuit
export function nonPolyComputedInner(o, k) {
  return o?.b.c[k]?.().map(x => x).length;
}
// an ALREADY-optional method access keeps its single `?.` - the short-circuit rewrite must
// not double it
export function alreadyOptionalTail(o) {
  return o?.b.c?.notPolyfilled?.().map(x => x).length;
}
