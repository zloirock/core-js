import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// inside a DEFERRED body the eager hook hands the store to the flush only when a CTOR / STATIC claim
// owns its value - that claim's channel is what renders the guard. a tail that claims nothing, a proxy
// hop and an INSTANCE dispatch each keep the store's own value: the instance channel renders its own
// receiver, and a claimless tail has no channel at all. read from BOTH spellings of the claim, because
// which one stands there is pass order: still above the store, or already inside the built guard's
// alternate. each form gets its own bindings - a second write to one alias deopts the follow
let c1, c2, n1, n2, h1, h2, i1, i2, out;
function eff() {}
const ctorClaim = () => null == (c1 = _globalThis, c2 = null == c1[eff(), 'window'] ? void 0 : _self) ? void 0 : _Promise.noSuchStatic;
const noClaim = () => (n1 = _globalThis, n2 = (eff(), _self)).noSuchStatic;
const hopTail = () => (h1 = _globalThis, h2 = (eff(), _self))?.window.noSuchStatic;
const instanceClaim = () => {
  var _ref;
  return null == (_ref = (i1 = _globalThis, i2 = (eff(), _self))) ? void 0 : _atMaybeArray(_ref.Array.prototype);
};
out = [ctorClaim, noClaim, hopTail, instanceClaim];
export const read = out;