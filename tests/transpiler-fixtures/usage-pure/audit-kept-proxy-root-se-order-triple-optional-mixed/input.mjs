// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
let tr;
export const tripleOptionalMixed = (tr = globalThis.window)?.[(c++, 'self')]?.self?.[(c++, 'self')].Array.of(9);
