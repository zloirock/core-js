import "core-js/modules/es.global-this";
// a CONDITIONALLY-written alias still might-injects: the taken path needs the polyfill and
// over-injection is the safe direction here
let CG;
if (cond) ({
  Math: CG
} = globalThis);