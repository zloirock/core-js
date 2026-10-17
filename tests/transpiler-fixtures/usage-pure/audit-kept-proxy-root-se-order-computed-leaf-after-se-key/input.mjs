// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// a COMPUTED leaf after the migrated hop: the splice resumes after the leaf's own closing bracket -
// slicing from the key's end left a stray `]` in the output (a parse break)
let x;
export const computedLeafAfterSeKey = (x = globalThis.window)?.[(c++, 'self')]['Array'].prototype.every.call([1], v => v);
