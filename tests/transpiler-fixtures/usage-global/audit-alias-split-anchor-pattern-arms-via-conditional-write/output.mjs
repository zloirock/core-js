import "core-js/modules/es.global-this";
import "core-js/modules/es.math.hypot";
// a CONDITIONALLY-written alias still might-injects: the taken path needs the polyfill and
// over-injection is the safe direction here
let CG;
if (cond) ({
  Math: CG
} = globalThis);
export const viaConditionalWrite = CG.hypot(dx, dy);
export const results = [viaConditionalWrite];