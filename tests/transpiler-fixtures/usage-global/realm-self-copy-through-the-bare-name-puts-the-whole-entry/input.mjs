// a global's own value written back into its slot through the bare name - read off a realm name, off another
// realm name, by a logical write - loads the whole family the slot then holds for other code, beyond the
// statics the later reads load
Promise = globalThis.Promise;
Iterator = self.Iterator;
URL &&= window.URL;
export const settled = Promise.allSettled([]);
export const values = Iterator.from([1].values()).toArray();
export const parses = URL.canParse('a:b');
