// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;
let g3;
export function inFunctionBody() { return (g3 = globalThis, v = g3.self).Array.prototype.at; }
export { v };
