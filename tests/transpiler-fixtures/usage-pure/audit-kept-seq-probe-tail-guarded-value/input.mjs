// a NESTED sequence whose tail navigates through the environment probe onto a backed hop
// (`globalThis.window.self`): the kept test observes the value, so the tail slot takes the
// GUARDED value render - the test decides on the probe and reads the always-defined leaf past
// it - on the static and the memoized instance route alike, and through an ALIAS root the same
// way. one leg used to drop the backed hop and read the bare probe, the other to test an
// always-defined leaf unconditionally.
// a kept WRITE in the tail takes the same guarded spelling exactly where the optional ctor hop
// is the claim's DIRECT object (the ctor's render rides the alternate and its test is the only
// reader of the store); a deeper store is read on the live tree and keeps the value form.
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
// NEGATIVE: the store below a deeper static keeps the value form - the live-tree read
export const storeInstance = (d++, (c++, k = globalThis.window.self))?.Number.MAX_SAFE_INTEGER.toFixed(1);
