// A claimed element followed by another keeps the whole array wrapper: an effectful neighbour still
// runs after the claimed element's own prefix and a pure one is carried along, while the static is
// served by a literal in the claimed slot.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { fromEntries } }] = [(eff('e'), globalThis), eff('f')];
const [{ Promise: { allSettled } }] = [(eff('g'), globalThis), 7];
export { fromEntries, allSettled, seen };
