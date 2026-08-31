import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// a static-FALLBACK claim (only the receiver swaps to the pure ctor) with a tail read over a
// NESTED sequence: the sequence value stays unproven under the kept-sequence boundary, so the
// swap may not eat the `?.` - the guard re-hangs with the sequence as its test, the tail riding
// the alternate. the same shape over the environment probe keeps the probe read in the test.
let c = 0,
  d = 0;
export const backedTail = null == (d++, c++, _self) ? void 0 : _Map.foo;
export const probeTail = null == (d++, c++, _globalThis.window) ? void 0 : _Map.length;

// NEGATIVE: a claim consuming the whole spelling folds - nothing reads past the erased guard
export const claimConsumes = (d++, c++, _Map);
// NEGATIVE: the flat spelling proves through the single level and collapses whole
export const flatTwin = (d++, _Map).foo;