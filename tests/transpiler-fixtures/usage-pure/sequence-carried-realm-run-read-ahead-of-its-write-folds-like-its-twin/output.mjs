import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a realm run handed on by a sequence and read before the file writes one of its hop slots still
// reads the realm: it folds onto the backed hop like its write-free twin, in a read and in the key
// of a deleted member alike
const holder = {};
export const readAhead = _self.readSlot;
export const keyAhead = delete holder[_self.keySlot];
delete _globalThis.self;