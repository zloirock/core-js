// A computed iterator-key assignment coerces a receiver that may be nullish before the key effect;
// a literal binding is never nullish and needs no check. The iterator method is read once after
// that effect, and the expression yields the receiver.
let eff = 0;
const arr = [3];
let it;
({ [(eff++, Symbol.iterator)]: it } = arr);
let viaOpaque;
({ [(eff++, Symbol.iterator)]: viaOpaque } = source);
export const r = [it, viaOpaque, eff];
