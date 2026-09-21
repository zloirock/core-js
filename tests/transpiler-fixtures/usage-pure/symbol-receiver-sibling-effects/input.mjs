// A nested iterator read keeps the full initializer once, including sibling effects.
let count = 0;
const hit = () => ++count;
const { w: { [Symbol.iterator]: method }, z } = { z: (hit(), 1), w: (hit(), globalThis) };
use(method, z, count);
