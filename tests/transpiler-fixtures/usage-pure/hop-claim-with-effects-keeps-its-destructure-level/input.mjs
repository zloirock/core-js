// A proxy claim preserves the mutated constructor's source slot. Neither a quiet receiver
// nor an effectful one authorizes an unclaimed constructor anchor; the prefix runs once.
let e = 0;
globalThis.Map = C;

// the hop claim carries a harvested sequence prefix, so the pattern keeps its own level
export const withEffects = (() => {
  const { Map: { size } } = (e++, globalThis).self;
  return size;
})();

// The effect-free twin also retains its nested pattern.
export const quiet = (() => {
  const { Map: { size } } = globalThis.self;
  return size;
})();

export { e };
