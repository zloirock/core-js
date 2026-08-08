import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A PURE constructor reached through a proxy-global HOP (`.self` / `.window`) and consumed by a terminal
// that yields no separate member meta (bare `.prototype` / dynamic computed key) whole-swaps to its pure
// import KEEPING the terminal: `globalThis.self.Map.prototype` -> `_Map.prototype`. dropping the ctor to
// `_globalThis.prototype` reads undefined off-engine (ie:11 `globalThis.self` is absent). distinct ctors
// and hop shapes per line: bare `.prototype`, dynamic `[k]`, alias-root hop, optional-chain hop, two hops.
const mapProto = _Map.prototype;
function setKey(k) {
  return _Set[k];
}
const g = _globalThis;
const promiseProto = _Promise.prototype;
const weakMapProto = _WeakMap.prototype;
const weakSetProto = _WeakSet.prototype;
export { mapProto, setKey, promiseProto, weakMapProto, weakSetProto };