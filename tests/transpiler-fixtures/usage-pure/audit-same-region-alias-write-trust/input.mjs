// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;

let g1;
out = (g1 = globalThis, v = g1.self).Array.prototype.at;

let g2;
export const inArrow = () => (g2 = globalThis, v = g2.self).Array.prototype.at;

let g3;
export function inFunctionBody() { return (g3 = globalThis, v = g3.self).Array.prototype.at; }

let g4;
export function inParamDefault(x = (g4 = globalThis, v = g4.self).Array.prototype.at) { return x; }

let g5;
export class InClassField { f = (g5 = globalThis, v = g5.self).Array.prototype.at; }

// ... and the receiver a claim COPIES into its helper argument carries the same trust: the copy
// keeps no source positions of its own, so it is stamped from the original before the collapse runs
let g6;
export const viaInstanceCopy = (g6 = globalThis, v = g6.self).Array.prototype.indexOf.call([5], 5);

// NEGATIVE: a write on ONE branch dominates nothing, and the read stays raw
let c;
if (out) { c = globalThis; }
export const conditionalWrite = (v = c.self).Array.prototype.at;

export { v, out };
