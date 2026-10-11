// a slot whose only install never runs in this build stays the build's own, so the identity guards over a
// selection reaching it keep their pure branch: a realm selection, a container whose `var` may not be
// initialized, and a realm's iterability test
if (typeof Promise == 'undefined') globalThis.Promise = PromiseShim;
if (typeof Map == 'undefined') globalThis.Map = MapShim;
if (typeof Symbol == 'undefined') globalThis.Symbol = SymbolShim;
export const viaRealm = (g || globalThis).Promise.resolve(1);
if (c) { var box = { M: Map }; }
export const viaBox = box.M.groupBy(list, key);
if (c) { var realm = globalThis; }
export const viaIn = realm.Symbol.iterator in list;
