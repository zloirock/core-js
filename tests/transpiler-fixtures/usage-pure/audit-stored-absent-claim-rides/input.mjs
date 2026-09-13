// A claim absent from the definitions still observes the stored terminal probe.
// The store keeps self.window even when BigInt has no pure entry. The flat
// navigation below separately exercises the existing plain-read collapse.
let k10;
export const viaAbsentClaimRide = (k10 = globalThis.window.self.window)?.BigInt;
export const viaPlainAbsentRide = globalThis.window.self.window?.BigInt;
