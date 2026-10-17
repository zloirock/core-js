// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// An effect around the assignment AND one in a hop key, under TWO optionals: the value effect stays
// inside the root memo (always runs, as written), the key effect rides the migrated key past the
// guard - each lands in its native slot.
let svd;
export const seBothDoubleOptional = (c++, svd = globalThis.window)?.self?.[(c++, 'self')].Array.prototype.findLast.call([6], v => v);
