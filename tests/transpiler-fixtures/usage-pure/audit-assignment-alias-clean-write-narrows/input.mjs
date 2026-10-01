// a CLEAN assignment-form ctor alias (the binding's single, unconditionally-placed write): member
// reads narrow through the registered trusted write - the whole-swap (`M = _Map`) alone would strand
// a separate static on the bare pure ctor (`M.groupBy` undefined off the constructor entry). the
// array-wrapped form pairs the slot through the wrapper the same way
let M;
({ Map: M } = globalThis);
export const r = typeof M.groupBy;
let A;
[{ Map: A }] = [globalThis];
export const q = typeof A.groupBy;
