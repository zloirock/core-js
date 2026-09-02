import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// a NESTED sequence whose tail navigates through the environment probe onto a backed hop
// (`globalThis.window.self`): the kept test observes the value, so the tail slot takes the
// GUARDED value render - the test decides on the probe and reads the always-defined leaf past
// it - on the static and the memoized instance route alike, and through an ALIAS root the same
// way. one leg used to drop the backed hop and read the bare probe, the other to test an
// always-defined leaf unconditionally.
// a kept WRITE in the tail takes the same guarded spelling exactly where the optional ctor hop
// is the claim's DIRECT object (the ctor's render rides the alternate and its test is the only
// reader of the store); a deeper store is read on the live tree and keeps the value form.
const ga = _globalThis;
let c = 0,
  d = 0,
  k;
export const staticCombined = null == (d++, c++, null == _globalThis.window ? void 0 : _self) ? void 0 : _nameMaybeFunction(_Map);
export const instanceNav = null == (_ref = (d++, c++, null == _globalThis.window ? void 0 : _self)) ? void 0 : _atMaybeArray(_ref.Array.prototype);
export const storeStatic = null == (d++, c++, k = null == _globalThis.window ? void 0 : _self) ? void 0 : _nameMaybeFunction(_Map);
export const aliasStatic = null == (d++, c++, null == ga.window ? void 0 : _self) ? void 0 : _nameMaybeFunction(_Map);
export const aliasInstance = null == (_ref2 = (d++, c++, null == ga.window ? void 0 : _self)) ? void 0 : _atMaybeArray(_ref2.Array.prototype);

// NEGATIVE: the flat spelling proves through the single level and collapses whole
export const flatTwin = _atMaybeArray((d++, _self).Array.prototype);
// NEGATIVE: a claim consuming the whole spelling folds - nothing reads past the erased guard
export const claimConsumes = (d++, c++, _Map);
// NEGATIVE: the store below a deeper static keeps the value form - the live-tree read
export const storeInstance = null == (d++, c++, k = _self) ? void 0 : _toFixedMaybeNumber(_ref3 = _Number$MAX_SAFE_INTEGER).call(_ref3, 1);