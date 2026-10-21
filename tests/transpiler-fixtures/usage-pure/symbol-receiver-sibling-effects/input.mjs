// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
let count = 0;
const hit = () => ++count;
const { w: { [Symbol.iterator]: method }, z } = { z: (hit(), 1), w: (hit(), globalThis) };
use(method, z, count);
