// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
let d;
export const effectInHopKey = (d = globalThis.window)?.[(c++, 'self')].Array.prototype.includes.call([1], 1);
export { c };
