// an alias write is TRUSTED for a read that stands in the same execution region: a function body, an
// arrow, a parameter default and a class-field initializer all defer, but if the region never runs
// neither does the read, so the write dominates it exactly as it does at statement level. judged
// against the READ's own position, not against the program - the write's own placement inside the
// region is still walked, so a genuinely conditional write stays untrusted (the last row).
// one alias per row on purpose: a second write of the same name is the SOLE-write question, which
// this file is not about
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
