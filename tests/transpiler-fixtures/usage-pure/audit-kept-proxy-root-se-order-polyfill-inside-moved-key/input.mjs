// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// a polyfillable call INSIDE the migrated key: its own rewrite must compose into the moved text
let y;
export const polyfillInsideMovedKey = (y = globalThis.window)?.[([c].flat(), 'self')].Array.prototype.some.call([1], v => v);
