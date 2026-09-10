// a computed hop key under a collapsed leaf still resolves the global it spells, and the leaf's own
// members resolve through it: the global method rewrites nothing here, so the lock is the import set
// alone - the Number statics and instance, self and Map. the last row has no hop key, it pins the
// plain shape
let u;
let g = 0;
let e = 0;
let c = 0;
export const belowLeaf = (u = globalThis.window)?.[(g++, 'Number')].MAX_SAFE_INTEGER.toFixed(2);
export const atLeaf = (u = globalThis.window)?.Number[(g++, 'MAX_SAFE_INTEGER')].toFixed(2);
export const seTailHopKey = (e++, globalThis)[(c++, 'self')].Map;
export const seTailPlain = (e++, globalThis).Map;
