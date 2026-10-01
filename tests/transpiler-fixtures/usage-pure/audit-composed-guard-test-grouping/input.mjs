// a `?.` whose object is a SEALED nav: the seal hides no short-circuit here, so the nav is the proxy
// global it navigates and the whole thing erases - the `?.` with it, since a ponyfill leaf is always
// defined. these rows lock that both legs say the same thing, and they stand where the composed-test
// spelling used to be produced, the one whose bare splice re-associated into
// `null == null == x ? void 0 : y ? void 0 : z`; the grouping rule that prevents it lives on in
// `plugin-helpers.js` as a spelling guard, with no render currently handing it a composed test.
let n = 0;
export const optionalAfterSeal = (globalThis.window).self?.Array.of(5);
export const optionalAfterSealDeep = (globalThis.self).window?.Array.of(5);
export const optionalAfterSealTail = (globalThis.window).self?.Array.prototype.at.call([1], 0);
export const optionalAfterSealSeq = ((n++, globalThis.window)).self?.Array.of(5);
// NEGATIVE: an atomic test (a member chain off the ponyfill) is spliced exactly as it was
export const atomicTest = globalThis.window?.Array.of(5);
