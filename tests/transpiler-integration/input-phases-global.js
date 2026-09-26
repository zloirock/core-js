// The sibling removes this read after pre. Post cannot discover the opaque consumer below,
// so the retained Array.from installation proves pre saw the original source.
Array.from([1]);
export const [before] = Function('return Array.from')()([3]);
// Only post can see the array-at read the sibling inserts here.
export const after = 'GLOBAL_SIBLING_INJECTS_HERE';
export const r = [before, after];
export const effects = [];
