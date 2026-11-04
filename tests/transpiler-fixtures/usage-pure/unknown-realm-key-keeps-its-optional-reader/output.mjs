import _globalThis from "@core-js/pure/actual/global-this";
// An unknown slot does not establish that the next receiver is the realm.
export const name = _globalThis[readKey()]?.self;
export const count = _globalThis[record(), 'missing']?.window.count;