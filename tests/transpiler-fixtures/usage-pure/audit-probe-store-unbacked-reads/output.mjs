import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a store whose value ends on an UNBACKED hop hands on the raw host read: an unbacked hop over it
// with no ponyfill to read through stays raw (re-reading the realm root there answered where
// native throws off-window), while a run through a BACKED hop folds as over any ponyfill; a full
// consume off such a store lifts the discarded read with the write, the throw the extraction
// erases - at any hop depth, since what decides is the store's own value, not the run above it
let w1, w2, w3, w4, w5, w6;
export const plainHop = (w1 = _globalThis.window).window.customSlot;
export const valueRead = typeof (w2 = _globalThis.window).window.Array;
export const deletedHop = delete (w3 = _globalThis.window).window.customSlot;
export const backedRun = (w4 = _globalThis.window).customSlot;
export const consumed = ((w5 = _globalThis.window).Array, _Array$of);
export const consumedPastHop = ((w6 = _globalThis.window).self, _Array$of);