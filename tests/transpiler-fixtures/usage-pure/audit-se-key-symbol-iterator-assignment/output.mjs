import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A computed iterator-key assignment captures its receiver before the key effect.
// The iterator method is read once after that effect, and the expression yields the receiver.
let eff = 0;
const arr = [3];
let it;
({} = arr), eff++, it = _getIteratorMethod(arr);
export const r = [it, eff];