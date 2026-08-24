import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a SECOND `?.` over the same proxy surface asks what the memo holds. the inner hop's value is
// what the outer test reads, so the memo holds THAT - and whether it has a spelling decides the
// shape. a PLAIN proxy nav collapses to a ponyfill, leaving no member read to re-run off a memo
// base, so the inner hop renders its own guard and the memo holds the rendered conditional. every
// other inner object keeps a spelling that must be evaluated exactly once - an unknown binding, a
// kept write, an effect-bearing sequence - so the memo holds it whole and both hops fold onto it.
let w, p, cb;
let sc = 0;
// PLAIN proxy nav below the second `?.`: the memo holds the inner render
export const plainNav = null == (_ref = null == _globalThis.window ? void 0 : _self) ? void 0 : _flatMaybeArray(_ref.Array.prototype).call([2, [3]]);
// a DEAD first `?.` (over the pristine root) is not the live probe, so the split takes the second
export const deadFirstHop = null == (_ref2 = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2.Array.prototype).call([4]);
// an unknown binding keeps its source chain in the memo and re-reads `.self` off it
export const openBinding = null == (_ref3 = w?.self) ? void 0 : _flatMaybeArray(_ref3.self.Array.prototype).call([5]);
// a kept WRITE has a spelling that must run once: the memo holds the write, the hops fold
export const keptWrite = null == (_ref4 = p = _globalThis.window) ? void 0 : _flatMaybeArray(_ref4.Array.prototype).call([6]);
// ... and so does an effect-bearing sequence around it
export const seqAroundWrite = null == (_ref5 = (sc++, cb = _globalThis.window)) ? void 0 : _flatMaybeArray(_ref5.Array.prototype).call([7]);
export { w, p, cb, sc };