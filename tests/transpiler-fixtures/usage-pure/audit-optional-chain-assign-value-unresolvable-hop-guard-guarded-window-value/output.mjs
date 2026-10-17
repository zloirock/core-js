import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Rooting the proxy-hop collapse THROUGH a chain-assignment proves the ROOT is a proxy global - it says nothing about what the
// assignment STORED.
let w;
export const guardedWindowValue = null == (w = _globalThis.window) ? void 0 : _includesMaybeArray(w.Array.prototype).call([1, 2], 2);