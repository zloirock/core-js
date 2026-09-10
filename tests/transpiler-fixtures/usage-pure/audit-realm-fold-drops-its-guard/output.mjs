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
// it stands - and the run under it is TERMINAL in the value that read consumes, so its probe hop
// keeps its own slot over the landed ponyfill rather than folding into it
export const guardedCallRoot = _self.window?.name;
export { q };