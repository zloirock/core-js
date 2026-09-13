import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// Nested sequence tails ending in the backed self hop store and read that ponyfill.
// The plain window hop adds no guard; each sequence prefix and kept assignment survives once.
// Static, instance and aliased roots obey the same value rule, including deeper consumers.
const ga = _globalThis;
let c = 0,
  d = 0,
  k;
export const staticCombined = null == (d++, c++, null == _globalThis.window ? void 0 : _self) ? void 0 : _nameMaybeFunction(_Map);
export const instanceNav = null == (_ref = (d++, c++, null == _globalThis.window ? void 0 : _self)) ? void 0 : _atMaybeArray(_ref.Array.prototype);
export const storeStatic = null == (d++, c++, k = _self) ? void 0 : _nameMaybeFunction(_Map);
export const aliasStatic = null == (d++, c++, _self) ? void 0 : _nameMaybeFunction(_Map);
export const aliasInstance = null == (_ref2 = (d++, c++, _self)) ? void 0 : _atMaybeArray(_ref2.Array.prototype);

// NEGATIVE: the flat spelling proves through the single level and collapses whole
export const flatTwin = _atMaybeArray((d++, _self).Array.prototype);
// NEGATIVE: a claim consuming the whole spelling folds - nothing reads past the erased guard
export const claimConsumes = (d++, c++, _Map);
// A deeper instance consumer likewise stores the backed self value and preserves both prefixes.
export const storeInstance = null == (d++, c++, k = _self) ? void 0 : _toFixedMaybeNumber(_ref3 = _Number$MAX_SAFE_INTEGER).call(_ref3, 1);