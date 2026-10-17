import _globalThis from "@core-js/pure/actual/global-this";
// the mirror of the excluded ROOT: here the configuration excluded the HOP's entry, so no claim can
// fire on it and the ROOT's own claim is the only driver left. under a `delete` the run navigates -
// the operator names a slot, and the hops between the base and that slot name the realm the base
// already is - so they fold onto it whatever this build can spell of them
let w;
export const deleteNav = delete _globalThis.box.customProp;
export const deleteOverStore = delete (w = _globalThis, _globalThis).customProp;
// ... and the same store with a bare PAREN around its value: that paren asserts nothing, so the two
// spellings of one source fold alike - a wrapper the carrier HOLDS is inside the stored value, not
// a consumer of it
export const deleteOverParenStore = delete (w = _globalThis, _globalThis).customProp;
// ... and what the dropped span DID rides out exactly once: a live sequence prefix already sits
// inside the base this fold lands, so harvesting it again ran the source's effect twice - only a
// carrier whose stored VALUE lands owes that re-emission
let e = 0;
export const deleteLivePrefixStore = delete (e++, w = _globalThis, _globalThis).customProp;
// ... and a sequence the store HOLDS runs inside the value it keeps, not ahead of the store: the
// delete still lands the root binding, and the effect stays where the source put it - once
export const deleteSeqInStore = delete (w = (e++, _globalThis), _globalThis).customProp;
export { e };
export { w };