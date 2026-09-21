// An iterator extraction reads the nested receiver without replaying sibling effects.
let count = 0, method, z;
const hit = () => ++count;
({ w: { [Symbol.iterator]: method }, z } = { z: (hit(), 1), w: (hit(), globalThis) });
use(method, z, count);
