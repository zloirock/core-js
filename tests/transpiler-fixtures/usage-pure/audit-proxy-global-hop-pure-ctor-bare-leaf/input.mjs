// A PURE constructor reached through a proxy-global HOP (`.self` / `.window`) and consumed by a terminal
// that yields no separate member meta (bare `.prototype` / dynamic computed key) whole-swaps to its pure
// import KEEPING the terminal: `globalThis.self.Map.prototype` -> `_Map.prototype`. dropping the ctor to
// `_globalThis.prototype` reads undefined off-engine (ie:11 `globalThis.self` is absent). distinct ctors
// and hop shapes per line: bare `.prototype`, dynamic `[k]`, alias-root hop, optional-chain hop, two hops.
const mapProto = globalThis.self.Map.prototype;
function setKey(k) { return globalThis.self.Set[k]; }
const g = globalThis;
const promiseProto = g.self.Promise.prototype;
const weakMapProto = globalThis?.self.WeakMap.prototype;
const weakSetProto = globalThis.self.window.WeakSet.prototype;
export { mapProto, setKey, promiseProto, weakMapProto, weakSetProto };
