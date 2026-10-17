// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
const plain = { self: { Array } };
let m;
export const seqPlainTail = (m = (c++, plain))?.self.Array.prototype.indexOf.call([1], 1);
