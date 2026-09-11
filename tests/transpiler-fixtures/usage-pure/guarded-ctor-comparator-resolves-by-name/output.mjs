import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// the runtime ctor guard's comparator is SYNTHESIZED - the source spells no constructor where it
// stands - so it resolves the ctor BY NAME, with no path standing in for one: handed the member's
// path, the resolve would read `M.groupBy`'s own call shape through the desc's filters.
// the seq prefix, the optional read and the second write render the same comparator; the last row
// is the boundary - an ESCAPING ctor value widens the ENTRY, and the comparator widens WITH it,
// because the test has to name the very binding the write put in the slot: resolved apart, it
// would be a second binding for the one value the guard is about
export function dotted(c) {
  let M;
  if (c) M = _Map;
  return M === _Map ? _Map$groupBy : M.groupBy;
}
export function seqPrefixed(c, n) {
  let M;
  if (c) M = _Map;
  return n++, M === _Map ? _Map$groupBy : M.groupBy;
}
export function optionalRead(c) {
  let M;
  if (c) M = _Map;
  return M === _Map ? _Map$groupBy : M?.groupBy;
}
export function twoWrites(c) {
  let W;
  if (c) W = _Map;
  if (!c) W = _WeakMap;
  return W === _Map ? _Map$groupBy : W.groupBy;
}
export function escapingCtorValue(c, sink) {
  let P;
  if (c) P = _Promise;
  sink(P);
  return P === _Promise ? _Promise$allSettled : P.allSettled;
}