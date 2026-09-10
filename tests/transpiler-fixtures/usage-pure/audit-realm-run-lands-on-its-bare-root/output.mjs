import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// the run's own ROOT is a landing like any hop: a backed name spelled BARE is the deepest thing
// pure can back, so the run lands there and every rule the landing carries reaches it - the probe
// a plain member READS THROUGH folds onto the binding, and the `?.` standing directly on that
// binding is dead text. read as "no landing exists", the run kept a native `window` read that its
// own one-hop-longer twin folds away, and the SAME source then spelled two ways depending on
// whether a `?.` stood over the claim.
// every row pairs with its plain-claim twin below it: the fold does not move with the claim's `?.`
let a, b, c, d, e, f, g, h;
export const bareRootReadThrough = null == (a = _self.Number) ? void 0 : _Number$isInteger(1);
export const bareRootPlainTwin = (b = _self.Number, _Number$isInteger)(1);
export const hopRootTwin = null == (c = _self.Number) ? void 0 : _Number$isInteger(1);
export const vestigialOverTheRoot = null == (d = _self.Number) ? void 0 : _Number$isInteger(1);
export const repeatedProbeHops = null == (e = _self.Number) ? void 0 : _Number$isInteger(1);
// NEGATIVE: a `?.` the SOURCE wrote over the probe branches on the read, so the hop keeps its slot
// and the test spells the run it tests
export const sourceBranchesOnTheProbe = null == (f = _self.window?.Number) ? void 0 : _Number$isInteger(1);
// NEGATIVE: an unspellable root has no landing of its own and nothing above it is backed either,
// so the whole run stays raw
export const noLandingAtAll = null == (g = window.window.Number) ? void 0 : _Number$isInteger(1);
// NEGATIVE: a shadowing binding holds the user's own object, and no realm landing may touch it
export function shadowed(self) {
  return (h = self.window.Number)?.isInteger(1);
}
// a QUIET computed realm hop names the slot its dotted twin names, so it rides the landing with the
// rest of the run - above the fold and below it alike
// NEGATIVE: an EFFECT-bearing key is a hop no fold may take - the effects would go with it and the
// landing has no slot to replay them in - so it and everything under it keep their place
let i,
  j,
  l,
  k = 0;
export const computedHopRidesTheFold = null == (i = _globalThis.Number) ? void 0 : _Number$isInteger(1);
export const computedHopBelowTheFoldRidesToo = null == (j = _globalThis.Number) ? void 0 : _Number$isInteger(1);
export const effectBearingHopKey = null == (l = _globalThis.window[k += 1, 'window'].Number) ? void 0 : _Number$isInteger(1);
export { a, b, c, d, e, f, g, h, i, j, k, l };