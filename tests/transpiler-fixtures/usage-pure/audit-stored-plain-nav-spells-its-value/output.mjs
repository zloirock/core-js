import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a PLAIN navigation the source stores: nothing above the store observes its absence, so the slot
// takes the navigation's own value - that nav IS the realm - and not the probe guard. the read
// through a live `?.` is the negative half: there the store's absence IS observed, and the guard
// stays for both emitters
let c = 0;
let plain;
let probed;
export const value = _atMaybeArray((plain = (c++, _self)).Array.prototype);
export const guarded = null == (probed = (c++, null == _globalThis.window ? void 0 : _self)) ? void 0 : _Number$MAX_SAFE_INTEGER;