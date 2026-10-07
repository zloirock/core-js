import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A computed iterator-key assignment coerces a receiver that may be nullish before the key effect;
// a literal binding is never nullish and needs no check. The iterator method is read once after
// that effect, and the expression yields the receiver.
let eff = 0;
const arr = [3];
let it;
eff++, it = _getIteratorMethod(arr);
let viaOpaque;
({} = source), eff++, viaOpaque = _getIteratorMethod(source);
export const r = [it, viaOpaque, eff];