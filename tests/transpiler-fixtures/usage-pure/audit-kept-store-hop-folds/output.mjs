import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the member ABOVE a folded kept-probe-store takes the `?.` of the hop that READ the store:
// a plain hop erases the `?.` there (a void store throws on that member exactly where the
// source threw on the hop), an optional first hop slides its probe up, and a deeper `?.`
// never travels - only the store-reading hop can see the void
let s1, s2, s3, s4, s5, s6;
export const storeFoldPlainHop = (s1 = _globalThis.window).customBox;
export const storeFoldNoParen = (s2 = _globalThis.window).customBox;
export const storeFoldOptionalSlide = (s3 = _globalThis.window)?.customBox;
export const storeFoldDeepOptional = (s4 = _globalThis.window).customBox;
export const storeFoldLongSpine = (s5 = _globalThis.window).customBox;
export const storeFoldPlainConsumer = (s6 = _globalThis.window).customBox;

// a spellable store re-reads the ROOT after the write, and the sequence hands that always-
// defined base on - the `?.` reading it erases with the fold
let s7;
export const storeFoldSpellableReRead = (s7 = _self, _self).customBox;

// the SE-keyed and multi-hop twins of the store-fold verdict: a computed key rides its own
// spelling over the kept store, and a two-hop folded run answers by the same first-hop rule
let s8,
  s9,
  e1 = 0;
export const storeFoldSeKey = (s8 = _globalThis.window)[e1++, 'customBox']?.q;
export { e1 };
export const storeFoldTwoHops = (s9 = _globalThis.window).Array;