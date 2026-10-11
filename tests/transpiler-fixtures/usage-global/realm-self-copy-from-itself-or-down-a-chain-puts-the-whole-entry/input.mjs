// a global's own value written back into its slot from its own bare name, or down a chain of writes through
// realm members, loads the whole family the slot then holds, beyond the statics the later reads load
URL = URL;
Iterator = globalThis.Iterator = self.Iterator;
export const parses = URL.canParse('a:b');
export const values = Iterator.from([1].values()).toArray();
