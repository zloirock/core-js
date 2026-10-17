// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;
let g4;
export function inParamDefault(x = (g4 = globalThis, v = g4.self).Array.prototype.at) { return x; }
export { v };
