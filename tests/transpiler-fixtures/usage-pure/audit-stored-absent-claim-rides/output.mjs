import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a claim ABSENT from the definitions (`BigInt` has no pure entry) rides the stored canon
// like the target-declined twin, and the plain-nav ride without an assignment guards the same
let k10;
export const viaAbsentClaimRide = (k10 = _self)?.BigInt;
export const viaPlainAbsentRide = _globalThis.BigInt;