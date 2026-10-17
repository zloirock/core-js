// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// two SE keys on one UNGUARDED kept root: the assignment (the object) runs first, then both key
// effects migrate into the surviving key in source order - a pre-root harvest would have run them
// before the assignment
let ud;
export const unguardedDoubleKey = (ud = globalThis.window)[(c++, 'self')][(c++, 'self')].Array.of(5);
