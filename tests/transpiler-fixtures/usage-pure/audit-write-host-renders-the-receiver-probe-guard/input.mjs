// a consumer that does not CLAIM the navigation still reads it: a write host addresses its own
// slot, and a member standing above the claim consumes the claim's value - in both the receiver's
// probe owes the guard that a plain read of the same navigation gets. left raw it reads `self` off
// the ponyfill root on hosts that have none
let out;
function eff() {}
(eff(), globalThis.window?.self).Array.prototype.at = 1;
export const { trunc } = (eff(), globalThis.window?.self).Array.prototype.at.Math;
out = (eff(), globalThis.window?.self).Array.prototype.at;
export const read = out;
