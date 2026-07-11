// a replaced `Symbol` slot is the user's namespace: its keys are NOT the well-known
// symbols, so symbol-key recognition bails and every read stays raw through the live slot
globalThis.Symbol = function FakeSymbol() {};
export const it = obj[Symbol.iterator];
const { [Symbol.iterator]: m } = arr2;
// a well-known-symbol STATIC value read follows the slot like any other member of it
export const k = Symbol.asyncIterator;
// the body-extract destructure alias bails the same way - the binding holds the fake's key
const { iterator } = Symbol;
export const viaAlias = obj2[iterator];
export default m;
