// A computed iterator-key assignment captures its receiver before the key effect.
// The iterator method is read once after that effect, and the expression yields the receiver.
let eff = 0;
const arr = [3];
let it;
({ [(eff++, Symbol.iterator)]: it } = arr);
export const r = [it, eff];
