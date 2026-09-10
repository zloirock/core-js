// the hop-host note travels with an effect-FREE hop claim only: with harvested effects the claim
// renders through its own channel, and re-anchoring the destructure there would drop the pattern
// level the mutated ctor is read through. the note's own arm - a mutated ctor as the sole hop -
// is what makes the re-anchor tempting, so the effect gate is the boundary under test.
// observable as TEXT only: both legs agree, and the import sets match either way
let e = 0;
globalThis.Map = C;

// the hop claim carries a harvested sequence prefix, so the pattern keeps its own level
export const withEffects = (() => {
  const { Map: { size } } = (e++, globalThis).self;
  return size;
})();

// NEGATIVE: the effect-free twin is the shape the note was written for
export const quiet = (() => {
  const { Map: { size } } = globalThis.self;
  return size;
})();

export { e };
