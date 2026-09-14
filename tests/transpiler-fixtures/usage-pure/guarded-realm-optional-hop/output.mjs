import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A guarded realm alias read through an OPTIONAL hop the chain continues past keeps the raw
// member: the identity guard cannot carry the `?.` to the hops above it, and the source
// short-circuits the whole chain where the realm is absent.
export function symbolMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return realm?.Symbol.iterator;
}
export function staticMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return realm?.Map.groupBy;
}
// The hop the chain ENDS on short-circuits inside the raw branch itself and keeps the guard.
export function lastHop(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return realm === _globalThis ? _Map : realm?.Map;
}