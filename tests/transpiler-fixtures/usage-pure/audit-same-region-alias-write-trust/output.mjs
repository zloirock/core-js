import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// an alias write is TRUSTED for a read that stands in the same execution region: a function body, an
// arrow, a parameter default and a class-field initializer all defer, but if the region never runs
// neither does the read, so the write dominates it exactly as it does at statement level. judged
// against the READ's own position, not against the program - the write's own placement inside the
// region is still walked, so a genuinely conditional write stays untrusted (the last row).
// one alias per row on purpose: a second write of the same name is the SOLE-write question, which
// this file is not about
let v, out;
let g1;
out = _atMaybeArray((g1 = _globalThis, v = _self).Array.prototype);
let g2;
export const inArrow = () => _atMaybeArray((g2 = _globalThis, v = _self).Array.prototype);
let g3;
export function inFunctionBody() {
  return _atMaybeArray((g3 = _globalThis, v = _self).Array.prototype);
}
let g4;
export function inParamDefault(x = _atMaybeArray((g4 = _globalThis, v = _self).Array.prototype)) {
  return x;
}
let g5;
export class InClassField {
  f = _atMaybeArray((g5 = _globalThis, v = _self).Array.prototype);
}

// ... and the receiver a claim COPIES into its helper argument carries the same trust: the copy
// keeps no source positions of its own, so it is stamped from the original before the collapse runs
let g6;
export const viaInstanceCopy = (g6 = _globalThis, v = _self).Array.prototype.indexOf.call([5], 5);

// NEGATIVE: a write on ONE branch dominates nothing, and the read stays raw
let c;
if (out) {
  c = _globalThis;
}
export const conditionalWrite = _at((v = c.self).Array.prototype);
export { v, out };