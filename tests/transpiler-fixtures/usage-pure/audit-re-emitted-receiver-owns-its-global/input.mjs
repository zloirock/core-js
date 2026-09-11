// a receiver a render RE-EMITS keeps its own proxy-global substitution. the detector marks the
// sequence-buried global handled so no second rewrite lands inside the claim's span, but only a
// receiver-LESS claim really consumes it: an instance claim hands the receiver to its helper, and a
// `delete` target renders nothing at all. every memoizing shape below froze a raw `globalThis` there.
let seq = 0;
export const directCall = (seq++, globalThis).Array.prototype.at(0);
export const optionalCall = (seq++, globalThis).Array.prototype.at?.(0);
export const parenLookup = ((seq++, globalThis).Array.prototype?.at)(0);
export const combined = (seq++, globalThis).Array.prototype.at?.(0).at(0);
export const spread = [...(seq++, globalThis).String.prototype.at(0)];
// runtime-dead on purpose: a `delete` of a polyfillable key renders nothing, so only the receiver's
// own substitution can carry the global - and no runtime leg may actually perform this deletion
export const deleted = delete (seq++, globalThis).Array.prototype.at;

// the plainly-wrapped `.call` beside them never memoized and never leaked - the control
export const plainWrap = (seq++, globalThis).Array.prototype.at.call([1, 2], -1);
// NEGATIVE: a constructor that DOES collapse consumes the whole receiver, root included
export const collapsingCtor = (seq++, globalThis).Map.prototype.has;
