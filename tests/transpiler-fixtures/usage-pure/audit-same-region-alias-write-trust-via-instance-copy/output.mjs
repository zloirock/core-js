import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;
// ... and the receiver a claim COPIES into its helper argument carries the same trust: the copy
// keeps no source positions of its own, so it is stamped from the original before the collapse runs
let g6;
export const viaInstanceCopy = (g6 = _globalThis, v = _self).Array.prototype.indexOf.call([5], 5);
export { v };