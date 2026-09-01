import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// the mirror of the excluded ROOT: here the configuration excluded the HOP's entry, so no claim can
// fire on it and the ROOT's own claim is the only driver left. under a `delete` the run navigates -
// the operator names a slot, and the hops between the base and that slot name the realm the base
// already is - so they fold onto it whatever this build can spell of them
let w;
const box = {
  self: {}
};
export const deleteRun = delete _globalThis.window;
export const deleteNav = delete _globalThis.box.customProp;
export const deleteOverStore = delete (w = _globalThis, _globalThis).customProp;
// ... and the same store with a bare PAREN around its value: that paren asserts nothing, so the two
// spellings of one source fold alike - a wrapper the carrier HOLDS is inside the stored value, not
// a consumer of it
export const deleteOverParenStore = delete (w = _globalThis, _globalThis).customProp;
export const deleteAboveDispatch = delete _at(_globalThis.box.list).name;

// ... and what the dropped span DID rides out exactly once: a live sequence prefix already sits
// inside the base this fold lands, so harvesting it again ran the source's effect twice - only a
// carrier whose stored VALUE lands owes that re-emission
let e = 0;
export const deleteLivePrefix = delete (e++, _globalThis).window;
export const deleteLivePrefixStore = delete (e++, w = _globalThis, _globalThis).customProp;
export { e };

// NEGATIVE: a TERMINAL run is the value the source asked for and keeps every hop this build cannot
// spell; only a NAVIGATED one folds - the same split the read canon draws with the entry present
export const readRun = _globalThis.self.window;
export const readNav = _globalThis.box.customProp;
export { w };