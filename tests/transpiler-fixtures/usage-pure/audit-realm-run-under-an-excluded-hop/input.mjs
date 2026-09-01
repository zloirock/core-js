// the mirror of the excluded ROOT: here the configuration excluded the HOP's entry, so no claim can
// fire on it and the ROOT's own claim is the only driver left. under a `delete` the run navigates -
// the operator names a slot, and the hops between the base and that slot name the realm the base
// already is - so they fold onto it whatever this build can spell of them
let w;
const box = { self: {} };
export const deleteRun = delete globalThis.self.window;
export const deleteNav = delete globalThis.self.box.customProp;
export const deleteOverStore = delete (w = globalThis).self.customProp;
// ... and the same store with a bare PAREN around its value: that paren asserts nothing, so the two
// spellings of one source fold alike - a wrapper the carrier HOLDS is inside the stored value, not
// a consumer of it
export const deleteOverParenStore = delete (w = (globalThis)).self.customProp;
export const deleteAboveDispatch = delete globalThis.self.box.list.at.name;

// ... and what the dropped span DID rides out exactly once: a live sequence prefix already sits
// inside the base this fold lands, so harvesting it again ran the source's effect twice - only a
// carrier whose stored VALUE lands owes that re-emission
let e = 0;
export const deleteLivePrefix = delete (e++, globalThis).self.window;
export const deleteLivePrefixStore = delete (e++, w = globalThis).self.customProp;
export { e };

// NEGATIVE: a TERMINAL run is the value the source asked for and keeps every hop this build cannot
// spell; only a NAVIGATED one folds - the same split the read canon draws with the entry present
export const readRun = globalThis.self.window;
export const readNav = globalThis.self.box.customProp;
export { w };
