import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// A sole alias write is trusted when it dominates the read in the same execution region.
// Function bodies, parameter defaults and class fields keep this local relationship.
// A conditional write requires a runtime identity check and retains the other receiver's read.
// Separate aliases keep multiple writes out of the claim.
let v, out;
let g1;
out = _atMaybeArray((g1 = _globalThis, v = _self).Array.prototype);
// NEGATIVE: a write on ONE branch dominates nothing, and the read stays raw
let c;
if (out) {
  c = _globalThis;
}
export const conditionalWrite = _at((v = c === _globalThis ? _self : c.self).Array.prototype);
export { v };
export { out };