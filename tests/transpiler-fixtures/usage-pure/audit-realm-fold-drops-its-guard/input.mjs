// a `?.` written over a realm run is reading the HOPS under it: once those fold onto the binding
// this build CAN spell, what the guard reads is a ponyfill that cannot be absent, so it erases with
// them - whichever hop of the run the source wrote it on, and whatever carrier stands at the root
let q;
function dh() { return globalThis; }
export const guardedTail = globalThis.self.window?.name;
export const guardedHop = globalThis.self?.window.name;
export const guardedBoth = globalThis.self?.window?.name;
export const guardedDeep = globalThis.self.window.self?.name;
export const guardedOverStore = (q = globalThis).self.window?.name;
export const guardedOverParenStore = (q = (globalThis)).self.window?.name;

// NEGATIVE: an opaque CALL root is undefinable by its own canon, so the guard the source wrote over
// it stands - the fold lands a ponyfill under it, but proving the run is what admits the erasure
export const guardedCallRoot = dh().self.window?.name;
export { q };
