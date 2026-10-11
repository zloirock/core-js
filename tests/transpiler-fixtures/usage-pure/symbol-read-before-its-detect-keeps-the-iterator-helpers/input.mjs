// reads of the well-known iterator symbol that run before the detect patching `Symbol` see the slot this
// build serves, so they keep their iterator helpers - spelled bare, off the realm, through an alias or as a
// destructured key
export const iterator = list[Symbol.iterator]();
export const iterable = Symbol.iterator in list;
export const viaRealm = list[globalThis.Symbol.iterator]();
export const realmIterable = globalThis.Symbol.iterator in list;
const S = Symbol;
export const viaAlias = list[S.iterator]();
const { iterator: key } = Symbol;
export const viaKey = list[key]();
globalThis.Symbol = globalThis.Symbol || SymbolShim;
