// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
let b;
export const effectAroundAssign = (c++, b = globalThis.window)?.self.Array.prototype.at.call([1], 0);
export { c };
