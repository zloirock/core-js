// outer pattern has siblings - `{ Array: { from }, Symbol } = globalThis`: the receiver is mirrored with the pure
// imports in its slots, so a static read off the bound `Symbol` respells too - standing alone as a statement it
// performs nothing and leaves, while a value keeps it
const { Array: { from }, Symbol } = globalThis;
from([1]);
Symbol.iterator;
export const iterator = Symbol.iterator;
