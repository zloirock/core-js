// the realm's own install (`window.globalThis = window`) replaces the slot the NAME `globalThis` reads and no other
// slot of the global object: a bare global, a static off it and a member of another realm name stay served, and a
// global's own patch below still meets reads ahead of it, its own value copied back into its slot putting the whole
// entry there. a read THROUGH the replaced name stays the user's
window.globalThis = window;
export const set = new Set([1]);
export const resolved = Promise.resolve(1);
export const cloned = structuredClone(value);
export const grouped = self.Map.groupBy(list, fn);
export const symbol = typeof Symbol;
export const weak = new WeakSet();
export const through = globalThis.Array.from(list);
export const has = 'Map' in globalThis;
Promise = self.Promise;
globalThis.WeakSet = MyWeakSet;
