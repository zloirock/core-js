// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let x;
let c = 0;
let e;
export const effectBothSides = (c++, e = globalThis.window)?.[(c++, 'self')].Array.prototype.findLast.call([1], x => x);
export { c };
