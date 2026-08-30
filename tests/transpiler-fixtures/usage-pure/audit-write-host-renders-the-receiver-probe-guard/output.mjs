import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a consumer that does not CLAIM the navigation still reads it: a write host addresses its own
// slot, and a member standing above the claim consumes the claim's value - in both the receiver's
// probe owes the guard that a plain read of the same navigation gets. left raw it reads `self` off
// the ponyfill root on hosts that have none
let out;
function eff() {}
(eff(), null == _globalThis.window ? void 0 : _self).Array.prototype.at = 1;
export const {
  trunc
} = _atMaybeArray((eff(), null == _globalThis.window ? void 0 : _self).Array.prototype).Math;
out = _atMaybeArray((eff(), null == _globalThis.window ? void 0 : _self).Array.prototype);
export const read = out;