// An alias holding the environment probe's value is the probe itself: the realm hops above it read
// self-references of that value, so the one test on the alias covers every optional link up the
// chain - for a read, a `typeof`, a `delete` and a sealed read alike, however the alias was written,
// as it already does under a constructor the chain ends in.
const win = globalThis.window;
let late;
late = self.window;
const deep = globalThis.self.window;
export const read = win?.window?.self.box;
export const kind = typeof deep?.window?.window?.self.flag;
export const removed = delete win?.window?.self?.slot;
export const sealed = (late?.window?.self).list;
export const built = new (deep?.window?.self.Set)();
