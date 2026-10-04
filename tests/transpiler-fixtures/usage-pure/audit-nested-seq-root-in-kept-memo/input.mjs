// A receiver whose proxy root sits under a nested sequence must preserve each prefix once.
// Substitution descends a sequence tail at every hop, including the inner sequence.
// A surviving root probe uses its runtime entry instead of an unavailable raw global.
// Proven navigation collapse may reuse its folded value without a guard memo.
// The flat spelling and static claims below exercise the same substitution boundaries.
// Guard retention follows the source claim; nested syntax alone does not require capture.
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
