// a realm run handed on by a sequence and read before the file writes one of its hop slots still
// reads the realm: it folds onto the backed hop like its write-free twin, in a read and in the key
// of a deleted member alike
const holder = {};
export const readAhead = (0, globalThis.window.self).readSlot;
export const keyAhead = delete holder[(0, globalThis.window.self).keySlot];
delete globalThis.self;
