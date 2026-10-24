// A chain assignment in a proxy navigation preserves its write and effects. A collapsed backed hop must use the assigned ponyfill
// value instead of leaving a raw realm hop.
let a, b, c, d, m, n, w;
const g = globalThis;
export const aliasInAssign = (d = g).self.Atomics;
