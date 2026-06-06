// side-effecting receiver combined with a side-effecting computed key. a naive `(key,
// getIterator(recv))` would run the key BEFORE the receiver, reordering the two effects vs native
// (receiver evaluates first), so the receiver memo is hoisted ahead of the key SE:
// `(_ref = recv, key, getIterator(_ref))` - helper still applies, order preserved. a side-effecting
// receiver with a plain key has no key SE to order against and passes the receiver directly.
export const a = getObj()[(p(), Symbol.iterator)]();
export const b = getObj()[Symbol.iterator]();
export const c = getList().items[(p(), Symbol.iterator)]();
