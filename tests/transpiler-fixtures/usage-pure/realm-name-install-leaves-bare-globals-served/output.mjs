import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
import _structuredClone from "@core-js/pure/actual/structured-clone";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set";
// the realm's own install (`window.globalThis = window`) replaces the slot the NAME `globalThis` reads and no other
// slot of the global object: a bare global, a static off it and a member of another realm name stay served, and a
// global's own patch below still meets reads ahead of it, its own value copied back into its slot putting the whole
// entry there. a read THROUGH the replaced name stays the user's
window.globalThis = window;
export const set = new _Set([1]);
export const resolved = _Promise$resolve(1);
export const cloned = _structuredClone(value);
export const grouped = _Map$groupBy(list, fn);
export const symbol = typeof _Symbol;
export const weak = new _WeakSet();
export const through = globalThis.Array.from(list);
export const has = 'Map' in globalThis;
Promise = _Promise;
globalThis.WeakSet = MyWeakSet;