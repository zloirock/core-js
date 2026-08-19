import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// a sequence prefix under a SEALED proxy navigation is re-emitted verbatim by the probe, so a claim
// living in that prefix has to keep its own rewrite and compose into the re-emission. skipping the
// whole consumed subtree shipped the prefix raw, while the unsealed spelling of the same source
// polyfilled it - one source, two answers, decided by a paren.
const log = [];
let n = 0;
export const sealedPrefixClaim = _atMaybeArray(_ref = ((_pushMaybeArray(log).call(log, 'x'), (null == _globalThis.window ? void 0 : _self).Array), _Array$of)(1)).call(_ref, 0);
export const unsealedPrefixClaim = (_pushMaybeArray(log).call(log, 'y'), null == _globalThis.window ? void 0 : _Array$of(1));
export const sealedPrefixTwoClaims = ((_pushMaybeArray(log).call(log, 'z'), _atMaybeArray(log).call(log, 0), (null == _globalThis.window ? void 0 : _self).Array), _Array$of)(2);
// NEGATIVE: a prefix effect that claims nothing re-emits verbatim either way
export const nonClaimPrefix = ((n++, (null == _globalThis.window ? void 0 : _self).Array), _Array$of)(3);