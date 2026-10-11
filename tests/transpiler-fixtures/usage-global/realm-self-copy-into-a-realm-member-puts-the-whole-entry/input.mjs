// a global's own value written back into its slot through a realm member - from the bare name, from another
// realm name, from the same member - loads the whole family the slot then holds, and a static's own value
// written back into the static loads the static
globalThis.Promise = Promise;
self.Iterator = globalThis.Iterator;
window.URL = window.URL;
Array.from = Array.from;
export const settled = Promise.allSettled([]);
export const values = Iterator.from([1].values()).toArray();
export const parses = URL.canParse('a:b');
export const listed = Array.from('ab');
