// A realm alias behind an effectful prefix keeps its effectful hop native in pure.
const realm = globalThis;
export const value = (prefix(), realm)[(key(), 'self')].Array.from([1]);
