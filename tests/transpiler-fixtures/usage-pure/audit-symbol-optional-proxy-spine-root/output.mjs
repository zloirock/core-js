import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// a symbol-iterator RECEIVER that is an all-proxy spine over a resolvable global root collapses to
// that root, and the `?.` over an undefinable hop (`globalThis.window`) dies with the erased span -
// the substituted root is always defined. the shared provider fact (`symbolReceiverProxyRoot`)
// decides the root and the optional verdict ONCE, so all three emitters render the same shape.
// the NEGATIVES bound it: a non-proxy leaf below the `?.` is a read that must happen off the
// guarded value, so the guard survives; a non-global root is the genuine helper argument and stays
// whole; and a polyfillable read buried in the erased span (`Promise`) stands down with it instead
// of earning an import nothing spells.
function eff() {
  return 0;
}
// sealed `?.` (paren-terminated) and live mid-chain `?.` reach the same root
export const sealed = _getIteratorMethod(_globalThis);
export const live = _getIteratorMethod(_globalThis);
// a discarded region's own claim stands down with the span it sits in
export const buried = _getIteratorMethod(_globalThis);
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