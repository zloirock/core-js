import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// a receiver whose proxy root sits under a NESTED sequence, kept whole inside the guard memo. the
// substitution has to descend a sequence tail at every hop, not only wrappers and members: stopping
// at the inner sequence froze a raw global in the emitted test, which is a ReferenceError on an
// engine without it. the flat spelling of the same receiver takes the collapse instead and is the
// negative that keeps the two apart.
let c = 0,
  d = 0;
export const nestedSeqRoot = null == (_ref = (d++, c++, _globalThis)) ? void 0 : _atMaybeArray(_ref.Array.prototype);
export const nestedSeqSelfRoot = null == (_ref2 = (d++, c++, _self)) ? void 0 : _atMaybeArray(_ref2.Array.prototype);
export const tripleNested = null == (_ref3 = (d++, c++, d++, _globalThis)) ? void 0 : _atMaybeArray(_ref3.Array.prototype);
// the discriminating row: a claim whose ctor RESOLVES marks the leaf handled by design, so the
// natural rewrite is suppressed and this render is the only substitution the root will get
export const ctorStaticClaim = null == (d++, c++, _globalThis) ? void 0 : _nameMaybeFunction(_Map);
export const ctorStaticOverNav = null == (d++, c++, _self) ? void 0 : _nameMaybeFunction(_Map);

// NEGATIVE: the flat sequence collapses its guard away, so no memo holds the root
export const flatSeqRoot = _atMaybeArray((d++, c++, _globalThis).Array.prototype);
// NEGATIVE: a nested sequence whose claim is a static needs no memo either
export const nestedSeqStatic = (d++, c++, _Array$of);