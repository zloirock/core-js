import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `?.` whose object is a SEALED nav: the seal hides no short-circuit here, so the nav is the proxy
// global it navigates and the whole thing erases - the `?.` with it, since a ponyfill leaf is always
// defined. these rows lock that both legs say the same thing, and they stand where the composed-test
// spelling used to be produced, the one whose bare splice re-associated into
// `null == null == x ? void 0 : y ? void 0 : z`; the grouping rule that prevents it lives on in
// `plugin-helpers.js` as a spelling guard, with no render currently handing it a composed test.
let n = 0;
export const optionalAfterSeal = _Array$of(5);
export const optionalAfterSealDeep = _Array$of(5);
export const optionalAfterSealTail = _atMaybeArray(_self.Array.prototype).call([1], 0);
export const optionalAfterSealSeq = (n++, _Array$of)(5);
// NEGATIVE: an atomic test (a member chain off the ponyfill) is spliced exactly as it was
export const atomicTest = null == _globalThis.window ? void 0 : _Array$of(5);