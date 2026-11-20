import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// Reading Symbol.iterator from the result of a sealed chain throws when window is absent.
// An open chain skips the lookup. Both use the iterator helper on a present realm.
function eff() {
  return 0;
}
export const sealed = _getIteratorMethod(null == _globalThis.window ? void 0 : _self);
export const live = null == _globalThis.window ? void 0 : _getIteratorMethod(_self);
// a discarded region's own claim stands down with the span it sits in
export const buried = _getIteratorMethod(null == _globalThis.window ? void 0 : _self);
// NEGATIVE: a non-proxy leaf below the `?.` keeps the guard - the read happens off the hop
export const kept = null == (_ref = _globalThis.window) ? void 0 : _getIteratorMethod(_ref.Array);
// NEGATIVE: a non-global root is the genuine argument
const o = {
  p: {
    q: [1]
  }
};
export const plain = _getIteratorMethod(o.p?.q);
// a KEPT root (a chain-assign storing a value that is not provably the global) re-hangs its guard
let w;
export const keptRoot = null == (_ref2 = w = _globalThis.window) ? void 0 : (eff(), _getIteratorMethod(_ref2));
export { o, w };