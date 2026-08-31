// a receiver whose proxy root sits under a NESTED sequence, kept whole inside the guard memo. the
// substitution has to descend a sequence tail at every hop, not only wrappers and members: stopping
// at the inner sequence froze a raw global in the emitted test, which is a ReferenceError on an
// engine without it. the flat spelling of the same receiver takes the collapse instead and is the
// negative that keeps the two apart. a NAV root folds inside the memo by the kept-value canon -
// the tail's own ponyfill - instead of collapsing the guard away like its flat twin.
let c = 0, d = 0;
export const nestedSeqRoot = (d++, (c++, globalThis))?.Array.prototype.at;
export const nestedSeqSelfRoot = (d++, (c++, self))?.Array.prototype.at;
export const nestedSeqNavRoot = (d++, (c++, globalThis.self))?.Array.prototype.at;
export const tripleNested = (d++, (c++, (d++, globalThis)))?.Array.prototype.at;
// the discriminating row: a claim whose ctor RESOLVES marks the leaf handled by design, so the
// natural rewrite is suppressed and this render is the only substitution the root will get
export const ctorStaticClaim = (d++, (c++, globalThis))?.Map.name;
export const ctorStaticOverNav = (d++, (c++, globalThis.self))?.Map.name;
// a `window`-named root is the realm surface too: the erased root needs no entry of its own,
// the mint is of the backed hop's ponyfill
export const windowRootStatic = (d++, (c++, window.self))?.Map.name;
export const windowRootNav = (d++, (c++, window.self))?.Array.prototype.at;

// NEGATIVE: the flat sequence collapses its guard away, so no memo holds the root
export const flatSeqRoot = (d++, c++, globalThis)?.Array.prototype.at;
// NEGATIVE: a nested sequence whose claim is a static needs no memo either
export const nestedSeqStatic = (d++, (c++, globalThis))?.Array.of;
