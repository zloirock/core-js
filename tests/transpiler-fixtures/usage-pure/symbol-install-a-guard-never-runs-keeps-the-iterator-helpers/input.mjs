// a Symbol install under a presence test the build decides never runs, so every well-known symbol key
// keeps its iterator helper: a member key, an `in` test, an alias, a destructured key, a class method key
if (typeof Symbol == 'undefined') globalThis.Symbol = SymbolShim;
export const iterator = list[Symbol.iterator]();
export const iterable = Symbol.iterator in list;
const S = Symbol;
export const viaAlias = list[S.iterator]();
const { iterator: key } = Symbol;
export const viaKey = list[key]();
export class Bag { [Symbol.iterator]() { return this; } }
