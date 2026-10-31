// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;

let a;
export const effectInsideValue = (a = (c++, globalThis.window)).self.Array.prototype.flat.call([1, [2]]);
export { c };
