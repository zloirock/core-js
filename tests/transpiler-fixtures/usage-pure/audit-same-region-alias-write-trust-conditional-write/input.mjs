// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;

let g1;
out = (g1 = globalThis, v = g1.self).Array.prototype.at;
// NEGATIVE: a write on ONE branch dominates nothing, and the read stays raw
let c;
if (out) { c = globalThis; }
export const conditionalWrite = (v = c.self).Array.prototype.at;
export { v };
export { out };
