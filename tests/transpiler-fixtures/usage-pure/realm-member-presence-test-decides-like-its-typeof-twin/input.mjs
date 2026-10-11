// a presence test of a realm member decides like its `typeof` twin: the build serves the global, so the
// install under it never runs and the user's shim never reaches the global object - off `globalThis` or
// `self`, through `window` (pure respells the probe away), a realm alias or a `||` install alike
if (!globalThis.Promise) globalThis.Promise = PromiseShim;
if (!self.Map) self.Map = MapShim;
if (!window.Iterator) window.Iterator = IteratorShim;
if (typeof globalThis.WeakMap == 'undefined') globalThis.WeakMap = WeakMapShim;
globalThis.Set || (globalThis.Set = SetShim);
const G = globalThis;
if (!G.WeakSet) G.WeakSet = WeakSetShim;
export const settled = Promise.allSettled([]);
export const grouped = Map.groupBy(list, key);
export const iter = Iterator.from(list);
export const weak = [new WeakMap(), new Set(), new WeakSet()];
