// the runtime ctor guard's comparator is SYNTHESIZED - the source spells no constructor where it
// stands - so it resolves the ctor BY NAME, with no path standing in for one: handed the member's
// path, the resolve would read `M.groupBy`'s own call shape through the desc's filters.
// the seq prefix, the optional read and the second write render the same comparator; the last row
// is the boundary - an ESCAPING ctor value widens the ENTRY, and the comparator widens WITH it,
// because the test has to name the very binding the write put in the slot: resolved apart, it
// would be a second binding for the one value the guard is about
export function dotted(c) {
  let M;
  if (c) M = globalThis.Map;
  return M.groupBy;
}
export function seqPrefixed(c, n) {
  let M;
  if (c) M = globalThis.Map;
  return (n++, M).groupBy;
}
export function optionalRead(c) {
  let M;
  if (c) M = globalThis.Map;
  return M?.groupBy;
}
export function twoWrites(c) {
  let W;
  if (c) W = globalThis.Map;
  if (!c) W = globalThis.WeakMap;
  return W.groupBy;
}
export function escapingCtorValue(c, sink) {
  let P;
  if (c) P = globalThis.Promise;
  sink(P);
  return P.allSettled;
}
