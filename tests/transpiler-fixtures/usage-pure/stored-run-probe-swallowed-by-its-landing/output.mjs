import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _self from "@core-js/pure/actual/self";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// a realm run STORED under a `?.` claim: that `?.` OBSERVES the store's absence, so a probe hop
// the landing would SWALLOW is lowered into the guard test instead - its read is the only thing
// that can make the value absent. a probe standing ABOVE the landing with a member reading through
// it folds away all the same, and the plain-claim twin - nothing observing the absence - takes the
// navigation's own value. the ALTERNATE this render lands is the ponyfill itself, so a realm hop
// read off it folds whatever `?.` the source wrote over that read, and the key standing directly on
// the landed binding drops the `?.` the landing made dead. a run with no backed hop above its root
// lands the ROOT, and the probe over it folds onto that binding exactly like its longer twin.
// the negative: the branch the source's own `?.` asked for below the landing stands as written.
// ... and the arm's own precondition: the realm prefix it plans for has to END on a hop pure BACKS.
// a run whose prefix leaf is the probe itself has no landing for the swallow to happen at, and a
// test built there reads a value the run never produces. the hop carrying that leaf is spelled with
// a key the fold may not TAKE - its effects would go with it - because a key the canon can name is
// the dotted hop in disguise and rides the landing with the rest of the run
let a, b, c, d, e, f, g, h, m;
let k = 0;
export const swallowedProbe = null == (a = null == _globalThis.window ? void 0 : _self.Number) ? void 0 : _Number$isInteger(1);
export const readThroughProbe = null == (b = _self.Object) ? void 0 : _Object$getOwnPropertyNames({});
export const plainClaimTwin = (c = _self.Number, _Number$parseFloat)('1.5');
export const foldedThenSwallowed = null == (f = null == _globalThis.window ? void 0 : _self.Object) ? void 0 : _Object$getOwnPropertySymbols({});
export const vestigialOverTheLanding = null == (g = null == _globalThis.window ? void 0 : _self.Number) ? void 0 : _Number$parseInt('7', 10);
export const sourceOptionalOverAFoldedHop = null == (h = null == _globalThis.window ? void 0 : _self.Number) ? void 0 : _Number$isInteger(3);
export const probeAboveTheRootLanding = null == (e = _globalThis.Symbol) ? void 0 : _Symbol$for('fc362');
export const sourceWroteTheHop = null == (d = null == _globalThis.window ? void 0 : _self.Array) ? void 0 : _Array$from([1]);
export const prefixLeafIsTheProbe = null == (m = null == _globalThis.window ? void 0 : _self[k++, 'window']) ? void 0 : _Number$isInteger(1);
export { a, b, c, d, e, f, g, h, k, m };