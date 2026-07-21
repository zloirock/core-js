// a receiver carrying its OWN live `?.` short-circuits the whole chain natively, so the
// combined dispatch tests it before the maybe-helper reads its member; folding it into the
// helper argument threw on a nullish receiver where native yields undefined
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
// the same receiver rule on the NON-polyfilled inner path: the method read off the receiver
// memo short-circuits too, so a nullish receiver yields undefined instead of throwing
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
