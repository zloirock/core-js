// Nested sequence tails ending in the backed self hop store and read that ponyfill.
// The plain window hop adds no guard; each sequence prefix and kept assignment survives once.
// Static, instance and aliased roots obey the same value rule, including deeper consumers.
const ga = globalThis;
let c = 0, d = 0, k;
export const staticCombined = (d++, (c++, globalThis.window.self))?.Map.name;
export const instanceNav = (d++, (c++, globalThis.window.self))?.Array.prototype.at;
export const storeStatic = (d++, (c++, k = globalThis.window.self))?.Map.name;
export const aliasStatic = (d++, (c++, ga.window.self))?.Map.name;
export const aliasInstance = (d++, (c++, ga.window.self))?.Array.prototype.at;

// NEGATIVE: the flat spelling proves through the single level and collapses whole
export const flatTwin = (d++, globalThis.window.self)?.Array.prototype.at;
// NEGATIVE: a claim consuming the whole spelling folds - nothing reads past the erased guard
export const claimConsumes = (d++, (c++, globalThis.window.self))?.Map;
// A deeper instance consumer likewise stores the backed self value and preserves both prefixes.
export const storeInstance = (d++, (c++, k = globalThis.window.self))?.Number.MAX_SAFE_INTEGER.toFixed(1);
