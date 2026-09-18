import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Symbol from "@core-js/pure/actual/symbol";
// A guarded realm alias read through an OPTIONAL hop the chain CONTINUES past spells the
// short-circuit ONCE over the whole continuation: the member-level conditional cannot carry the
// `?.` to the hops above it, so the guard hoists and the raw branch is spelled plain. The steps the
// guard absorbs are the plan's, rebuilt by each emitter, so the two legs print one shape.
// A tail the guard cannot absorb keeps the member-level narrow with its `?.`, which is exact
// there: a chain that ENDS, a next step that short-circuits too, and a SEAL, where the source's own
// read of the short-circuited value throws and a guard would answer undefined instead.
// The hop the guard absorbs is the one whose value the test can read: the member's own (tested on
// the capture, inside it) or the RECEIVER's last one over an identifier base (tested on that base).
// A second live hop, a deeper one, a sealed callee slot and a continuation above an absorbed `?.()`
// keep bailing - each would need a test the guard has no value for, or a copy in every branch.
export function symbolMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (realm === _globalThis ? _Symbol : realm.Symbol).iterator;
}
export function staticMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (realm === _globalThis ? _Map : realm.Map).groupBy;
}
// The hop the chain ENDS on short-circuits inside the raw branch itself and keeps the guard.
export function lastHop(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return realm === _globalThis ? _Map : realm?.Map;
}
// A CALLEE under that hop rides the same guard: the call moves INTO the branches, so `this` is the
// branch's own value and its arguments still run ahead of the throw a non-callable method owes,
// while the short-circuit is spelled once, over the whole render, off the hop's own base.
export function callMember(flag) {
  var _ref;
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (_ref = realm.Array, _ref === Array ? _Array$of(7) : _ref.of(7));
}
// A `?.` on the NEXT step reads the guard's own value, so the narrow stays at member level.
export function midChain(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Map : realm?.Map)?.groupBy;
}
// A SEAL makes the source read the short-circuited value: the native throw is kept.
export function sealedChain(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Map : realm?.Map).groupBy;
}
// An effectful prefix on the receiver runs once, ahead of the whole guard.
export const prefixLog = [];
export function seqPrefix(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return _pushMaybeArray(prefixLog).call(prefixLog, 'r'), null == realm ? void 0 : (realm === _globalThis ? _Map : realm.Map).groupBy;
}