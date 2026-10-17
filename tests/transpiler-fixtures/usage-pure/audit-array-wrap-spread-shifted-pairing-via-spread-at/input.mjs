// spread AT the slot bails too (position is runtime-determined from the spread on)
let head = [globalThis];
const [{ Promise: P }] = [...head];
export const viaSpreadAt = P.allSettled([]);
