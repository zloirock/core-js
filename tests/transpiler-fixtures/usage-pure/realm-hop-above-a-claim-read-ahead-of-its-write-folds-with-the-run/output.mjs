import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a realm hop read directly above a hop claim seals the claim off only while its slot holds the
// user's object: read BEFORE the file writes that slot it is still the realm, and the run folds like
// its write-free twin across the paren or the cast written below it
export const parenRead = _self.parenSlot;
export const castRead = _self.castSlot;
delete _globalThis.window;