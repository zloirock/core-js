import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// the SAME claim written twice: the second copy writes the alias the first one reads, and both writes
// store the same global - so neither copy loses the alias, and the first renders exactly as it does
// alone. the trust verdict reads the write off the violation the leg hands it, and one leg hands the
// assigned IDENTIFIER rather than the assignment: asking the node for a parent answered null there,
// the agreeing writes read as disagreeing, and the first copy silently fell back to a raw hop read.
let g, v, out;
out = (g = _globalThis, v = _self, _Number$MAX_SAFE_INTEGER);
export const twin = (g = _globalThis, v = _self, _Number$MAX_SAFE_INTEGER);
export const stored = v;
export const single = (() => {
  let h, w;
  return h = _globalThis, w = _self, _Number$MAX_SAFE_INTEGER;
})();
export const r = out;