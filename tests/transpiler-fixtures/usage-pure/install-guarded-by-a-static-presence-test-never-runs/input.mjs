// a presence test of a static decides like a test of its global where the catalogue names the static a method: its
// `typeof` is a function wherever the build serves it and an `in` test of its key is true, so the install under
// either never runs and every read takes the pure import - the test read where it stands, ahead of a later write
// of the slot. a well-known symbol's `typeof` is no such answer, an engine core-js polyfills it on answering apart
if (typeof Promise.allSettled != 'function') globalThis.Promise = PromiseShim;
export const settled = Promise.allSettled(list);
if (isBrowser) globalThis.Promise = BrowserPromise;
if (!('groupBy' in Map)) globalThis.Map = MapShim;
export const grouped = Map.groupBy(list, key);
if (typeof Symbol.asyncIterator != 'symbol') globalThis.Symbol = SymbolShim;
export const asyncIterator = Symbol.asyncIterator;
