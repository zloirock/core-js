// spread AT the slot: the spread source's own items are its candidates (a literal `head` holding
// the realm), so the realm constructor's modules inject as a maybe
let head = [globalThis];
const [{ Promise: P }] = [...head];
export const viaSpreadAt = P.allSettled([]);
