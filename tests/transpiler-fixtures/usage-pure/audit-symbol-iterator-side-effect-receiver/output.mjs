import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref, _ref2;
// side-effecting receiver combined with a side-effecting computed key. a naive `(key,
// getIterator(recv))` would run the key BEFORE the receiver, reordering the two effects vs native
// (receiver evaluates first), so the receiver memo is hoisted ahead of the key SE:
// `(_ref = recv, key, getIterator(_ref))` - helper still applies, order preserved. a side-effecting
// receiver with a plain key has no key SE to order against and passes the receiver directly.
export const a = (_ref = getObj(), p(), _getIterator(_ref));
export const b = _getIterator(getObj());
export const c = (_ref2 = getList().items, p(), _getIterator(_ref2));