import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// A receiver whose proxy root sits under a nested sequence must preserve each prefix once.
// Substitution descends a sequence tail at every hop, including the inner sequence.
// A surviving root probe uses its runtime entry instead of an unavailable raw global.
// Proven navigation collapse may reuse its folded value without a guard memo.
// The flat spelling and static claims below exercise the same substitution boundaries.
// Guard retention follows the source claim; nested syntax alone does not require capture.
let c = 0,
  d = 0;
export const nestedSeqRoot = null == (d++, c++, _globalThis) ? void 0 : _atMaybeArray(_globalThis.Array.prototype);
export const nestedSeqSelfRoot = null == (d++, c++, _self) ? void 0 : _atMaybeArray(_self.Array.prototype);
export const nestedSeqNavRoot = null == (d++, c++, _self) ? void 0 : _atMaybeArray(_self.Array.prototype);
export const tripleNested = null == (d++, c++, d++, _globalThis) ? void 0 : _atMaybeArray(_globalThis.Array.prototype);
// the discriminating row: a claim whose ctor RESOLVES marks the leaf handled by design, so the
// natural rewrite is suppressed and this render is the only substitution the root will get
export const ctorStaticClaim = null == (d++, c++, _globalThis) ? void 0 : _nameMaybeFunction(_Map);
export const ctorStaticOverNav = null == (d++, c++, _self) ? void 0 : _nameMaybeFunction(_Map);
// a `window`-named root is the realm surface too: the erased root needs no entry of its own,
// the mint is of the backed hop's ponyfill
export const windowRootStatic = null == (d++, c++, _self) ? void 0 : _nameMaybeFunction(_Map);
export const windowRootNav = null == (d++, c++, _self) ? void 0 : _atMaybeArray(_self.Array.prototype);

// NEGATIVE: the flat sequence collapses its guard away, so no memo holds the root
export const flatSeqRoot = _atMaybeArray((d++, c++, _globalThis).Array.prototype);
// NEGATIVE: a nested sequence whose claim is a static needs no memo either
export const nestedSeqStatic = (d++, c++, _Array$of);