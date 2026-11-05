// A trailing array element keeps the whole wrapper and its native static property read.
// The selected element's prefix runs before the effectful or quiet neighbour.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { fromEntries } }] = [(eff('e'), globalThis), eff('f')];
const [{ Promise: { allSettled } }] = [(eff('g'), globalThis), 7];
export { fromEntries, allSettled, seen };
