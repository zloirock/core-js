import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a claim ABSENT from the definitions (`BigInt` has no pure entry) rides the stored canon
// like the target-declined twin, and the plain-nav ride without an assignment guards the same
let k10;
export const viaAbsentClaimRide = (k10 = globalThis.window.self.window)?.BigInt;