import _globalThis from "@core-js/pure/actual/global-this";
// a `delete` over a SEALED navigation reads the deleted member plainly off the sealed value: the
// `?.` the fold drops may not slide across the seal - a void store then throws on the member
// where the unsealed twin short-circuits the whole delete and answers true
let w1, w2;
export const sealedOverStore = delete (w1 = _globalThis.window).customSlot;
export const openOverStore = delete (w2 = _globalThis.window)?.customSlot;