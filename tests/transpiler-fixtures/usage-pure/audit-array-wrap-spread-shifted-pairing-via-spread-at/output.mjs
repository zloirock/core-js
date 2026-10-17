import _globalThis from "@core-js/pure/actual/global-this";
// spread AT the slot bails too (position is runtime-determined from the spread on)
let head = [_globalThis];
const [{
  Promise: P
}] = [...head];
export const viaSpreadAt = P.allSettled([]);