import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// an INSTANCE dispatch memoizes its receiver, and when that receiver is a proxy nav carrying the
// environment probe the memo has to hold the COLLAPSED value: spelled raw it reads `.window` off the
// ponyfill and then the next hop off the undefined that answers. the guard root here is not a nav at
// all - its top hop is the CLAIM name - so the collapse plan refused it and the ladder fell to the
// root-substituted spelling, which also dropped the `?.` the source wrote. the keys re-hang INSIDE
// the alternate, where the ponyfill leaf is always defined, which is what the AST emitter spells.
export const memoOverProbe = null == (_ref = _self.Array) ? void 0 : _flatMaybeArray(_ref.prototype);
export const memoOverProbeCall = null == (_ref2 = _self.Array) ? void 0 : _flatMaybeArray(_ref2.prototype).call([[1]]);
export const memoTwoKeys = null == (_ref3 = _self.Array) ? void 0 : _includesMaybeArray(_ref3.prototype);
// the same nav with no instance tail keeps the plain guarded read
export const plainRead = _self.Array?.prototype;
// NEGATIVE: a SEAL between the keys and the nav ends the chain - the read above it is the source's
// own throw, so the keys stay OUTSIDE the guard
export const sealedKeys = null == (_ref4 = _self.Array.prototype) ? void 0 : _flatMaybeArray(_ref4);
// NEGATIVE: no probe under the `?.` - the nav collapses whole and no guard is built
export const noProbe = null == (_ref5 = _self.Array) ? void 0 : _flatMaybeArray(_ref5.prototype);