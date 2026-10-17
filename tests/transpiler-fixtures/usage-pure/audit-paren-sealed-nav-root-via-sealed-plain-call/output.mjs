import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// PLAIN claims through the sealed root claim receiverless, but the erase re-emits the read
// the source performs on the sealed VALUE as a THROW probe ahead of the claim: an absent
// `window` throws at the probe exactly as the source does, a present one reads through the
// ponyfill and drops the value - call, destructure and the claimable ctor value-use alike
export const viaSealedPlainCall = _atMaybeArray(_ref = ((null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(6)).call(_ref, 0);