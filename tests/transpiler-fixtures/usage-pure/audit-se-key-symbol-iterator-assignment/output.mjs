import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// A computed iterator-key assignment captures its receiver before the key effect.
// The iterator method is read once after that effect, and the expression yields the receiver.
let eff = 0;
const arr = [3];
let it;
_ref = arr, null == _ref ? _ref[""] : (eff++, it = _getIteratorMethod(_ref)), _ref;
export const r = [it, eff];