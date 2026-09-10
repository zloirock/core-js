import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// the ENTRY a constructor resolves to is ONE answer per name per file, never one per reference: the
// namespace entry and the bare `*/constructor` under it name the same runtime value, so a
// per-position answer mints a second binding for it - and the ctor-identity guard then tests a value
// taken from one against the other, a comparison that passes only while the two modules happen to
// export the same object. every row spells an ESCAPING reference beside a non-escaping one, in each
// spelling the census stamps: a bare read, a proxy hop, a pattern slot - and the last two carry no
// guard at all, the split being the entry decision's own, not the guard's. the case-level shadow in
// the first three rows hands out ITS OWN value, so the outer name is handed out beside it - a leaf
// resolving to the inner binding is not an escape of the constructor the outer one holds
export function discriminantClosureWrite(mk) {
  let W = _Map;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return (W === _Map ? _Map$groupBy : W.groupBy.bind(W))([1, 2], x => x % 2);
}
export function guardBesideAConstruction(mk) {
  let W = _Map;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [(W === _Map ? _Map$groupBy : W.groupBy.bind(W))([1], x => x), new _Map()];
}
export function proxyHopWrite(mk) {
  let W = _Set;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [W, new _Set()];
}
export function patternSlotWrite(mk) {
  const W = _WeakMap;
  mk(W);
  return new _WeakMap();
}
export function escapeWithNoGuard(mk) {
  mk(_Promise);
  return new _Promise(r => r(1));
}
export class Extended extends _Promise {}