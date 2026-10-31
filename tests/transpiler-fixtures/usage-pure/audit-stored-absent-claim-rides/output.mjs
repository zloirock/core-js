import _self from "@core-js/pure/actual/self";
// A claim absent from the definitions still observes the stored terminal probe.
// The store keeps self.window even when BigInt has no pure entry. The flat
// navigation below separately exercises the existing plain-read collapse.
let k10;
export const viaAbsentClaimRide = (k10 = _self.window)?.BigInt;
export const viaPlainAbsentRide = _self.BigInt;