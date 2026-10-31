import _globalThis from "@core-js/pure/actual/global-this";
// multi-declarator host: the replayed effect stays BETWEEN sibling inits (native order) -
// the anchored residual owns its SE inline instead of lifting it above the pre-sibling
const sA = sideA();
const {
  onresize: onrs
} = (eff(), _globalThis);
const sB = sideB();
export const r = [sA, onrs, sB];