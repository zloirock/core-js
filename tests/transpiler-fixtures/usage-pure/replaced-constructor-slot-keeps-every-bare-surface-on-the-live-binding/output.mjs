import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set";
// a whole-CTOR slot replacement (`globalThis.Set = Shim`) keeps every bare surface of the name read after
// it on the live binding - a construction, a value, an unknown key, a shorthand, `?.`, a prefixed receiver,
// `in`, an instance method of what it constructs, `typeof` - since the pure import would discard the shim;
// a read before every write of the slot takes the pure import, and an untouched constructor stays served
export const early = new _Set([0]);
_globalThis.Set = function ShimSet() {};
export const s = new Set();
export const m = new _Map([[1, 2]]);
const {
  [k()]: v
} = Set;
export const sk = v;
export const o = {
  Set
};
export const u = Set?.union;
export const seqRecv = (eff(), Set).difference;
export const inCheck = 'union' in Set;
export const sub = new Set([1]).isSubsetOf(other);
export const tg = typeof Set;