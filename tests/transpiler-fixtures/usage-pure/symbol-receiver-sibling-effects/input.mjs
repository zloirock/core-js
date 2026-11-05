// Literal sibling effects run in property construction order before the iterator read.
// The iterator helper uses the selected realm slot without replaying those effects.
let count = 0;
const hit = () => ++count;
const { w: { [Symbol.iterator]: method }, z } = { z: (hit(), 1), w: (hit(), globalThis) };
use(method, z, count);
