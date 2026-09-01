import _self from "@core-js/pure/actual/self";
// a `?.` written over a realm run is reading the HOPS under it: once those fold onto the binding
// this build CAN spell, what the guard reads is a ponyfill that cannot be absent, so it erases with
// them - whichever hop of the run the source wrote it on, and whatever carrier stands at the root
let q;
function dh() {
  return globalThis;
}
export const guardedTail = _self.name;
export const guardedHop = _self.name;
export const guardedBoth = _self.name;
export const guardedDeep = _self.name;
export const guardedOverStore = (q = globalThis, _self).name;
export const guardedOverParenStore = (q = globalThis, _self).name;

// NEGATIVE: an opaque CALL root is undefinable by its own canon, so the guard the source wrote over
// it stands - the fold lands a ponyfill under it, but proving the run is what admits the erasure
export const guardedCallRoot = _self?.name;
export { q };