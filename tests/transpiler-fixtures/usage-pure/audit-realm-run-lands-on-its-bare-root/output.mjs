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
export const bareRootReadThrough = (a = _self.Number, _Number$isInteger)(1);
export const bareRootPlainTwin = (b = _self.Number, _Number$isInteger)(1);
export const hopRootTwin = (c = _self.Number, _Number$isInteger)(1);
export const vestigialOverTheRoot = (d = _self.Number, _Number$isInteger)(1);
export const repeatedProbeHops = (e = _self.Number, _Number$isInteger)(1);
// NEGATIVE: a `?.` the SOURCE wrote over the probe branches on the read, so the hop keeps its slot
// and the test spells the run it tests
export const sourceBranchesOnTheProbe = null == (f = _self.window?.Number) ? void 0 : _Number$isInteger(1);
// An unbacked root keeps its original receiver read and any resulting throw;
// the recognized receiver-independent static still receives its ponyfill.
export const noLandingAtAll = (g = window.window.Number, _Number$isInteger)(1);
// NEGATIVE: a shadowing binding holds the user's own object, and no realm landing may touch it
export function shadowed(self) {
  return (h = self.window.Number)?.isInteger(1);
}
// a QUIET computed realm hop names the slot its dotted twin names, so it rides the landing with the
// rest of the run - above the fold and below it alike
// A computed-key effect runs once before the plain navigation lands. It does not
// prevent the same middle-hop collapse that its quiet-key twin receives.
let i,
  j,
  l,
  k = 0;
export const computedHopRidesTheFold = (i = _globalThis.Number, _Number$isInteger)(1);
export const computedHopBelowTheFoldRidesToo = (j = _globalThis.Number, _Number$isInteger)(1);
export const effectBearingHopKey = (l = (k += 1, _globalThis).Number, _Number$isInteger)(1);
export { a, b, c, d, e, f, g, h, i, j, k, l };