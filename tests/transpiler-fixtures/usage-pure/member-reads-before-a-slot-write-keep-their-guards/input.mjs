// member reads that run before every write of a global's slot see the slot this build serves, so the
// guards over them keep their pure branch: a realm selection read off directly and a realm's
// iterability test
export const viaRealm = (g || globalThis).Promise.resolve(1);
if (c) { var realm = globalThis; }
export const viaIn = realm.Symbol.iterator in list;
globalThis.Promise = PromiseShim;
globalThis.Symbol = SymbolShim;
