import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// a presence test of a static decides like a test of its global where the catalogue names the static a method: its
// `typeof` is a function wherever the build serves it and an `in` test of its key is true, so the install under
// either never runs and every read takes the pure import - the test read where it stands, ahead of a later write
// of the slot. a well-known symbol's `typeof` is no such answer, an engine core-js polyfills it on answering apart
if (typeof _Promise$allSettled != 'function') _globalThis.Promise = PromiseShim;
export const settled = _Promise$allSettled(list);
if (isBrowser) _globalThis.Promise = BrowserPromise;
if (!true) _globalThis.Map = MapShim;
export const grouped = _Map$groupBy(list, key);
if (typeof Symbol.asyncIterator != 'symbol') _globalThis.Symbol = SymbolShim;
export const asyncIterator = Symbol.asyncIterator;