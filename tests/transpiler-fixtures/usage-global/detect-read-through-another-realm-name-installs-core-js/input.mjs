// a detect read through another realm name than its write still feeds that write after an explicit write of the
// slot, as in the same-name spelling: usage-global loads what each detect reads, whichever side the bare name
// or a realm member spells, and the whole family of a value it hands into the realm's slot
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
