// a detect read through another realm name than its write still feeds that write after an explicit write of the
// slot: core-js wins it exactly as in the same-name spelling, whichever side the bare name or a realm member
// spells. a wrapper of the slot and a read after the patch stay the user's
globalThis.WeakSet = UserWeakSet;
WeakSet = self.WeakSet || ShimWeakSet;
globalThis.Promise = UserPromise;
self.Promise = globalThis.Promise || ShimPromise;
self.Map = UserMap;
Map = window.Map || ShimMap;
Set = UserSet;
window.Set = Set || ShimSet;
globalThis.URL = UserURL;
URL = wrap(self.URL);
export const later = new window.Map();
