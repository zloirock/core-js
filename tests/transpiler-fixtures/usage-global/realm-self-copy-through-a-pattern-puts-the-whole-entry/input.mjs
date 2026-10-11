// a global's own value written back into its slot through a pattern - a key read off the realm, a key under a
// realm hop, an element paired with a realm read - loads the whole family the slot then holds for other code,
// beyond the statics the later reads load
({ Promise } = globalThis);
({ self: { Iterator } } = globalThis);
[URL] = [globalThis.URL];
export const settled = Promise.allSettled([]);
export const values = Iterator.from([1].values()).toArray();
export const parses = URL.canParse('a:b');
