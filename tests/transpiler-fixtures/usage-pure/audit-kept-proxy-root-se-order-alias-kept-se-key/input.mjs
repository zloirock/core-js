// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// an ALIAS-carried kept root: the alias identifier is already rewritten by its declaration, and the
// migrated key composes over it exactly like over the direct spelling
const alias = globalThis;
let z;
export const aliasKeptSeKey = (z = alias.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v);
