// a global's own value written back into its slot through a realm member - from the bare name, from another
// realm name, from the same member - loads the whole family the slot then holds.
globalThis.Promise = Promise;
self.Iterator = globalThis.Iterator;
window.URL = window.URL;
export const settled = Promise.allSettled([]);
export const values = Iterator.from([1].values()).toArray();
export const parses = URL.canParse('a:b');
