import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// A realm run stored in a KEPT WRITE, landed on the deepest span pure can back: what that span
// spells BELOW its own key is discarded with it, so a sequence prefix and the write under the run
// survive the landing. A `?.` INSIDE the span leaves no landing - the collapse spells the run
// instead, lowering the probe into a guard test and folding the backed hop, an SE-bearing hop key
// running in that test. The last line is the negative: a span of nothing but hops lands whole.
let c = 0;
let k = 0;
let seqStored;
export const seqPrefixAhead = null == (seqStored = (c++, _self).window?.Array) ? void 0 : _Array$from([1]);
let root;
let writeStored;
export const writeUnderTheRun = null == (writeStored = (root = _globalThis, _self).window?.Promise) ? void 0 : _Promise$resolve(1);
let probeStored;
export const probeInsideTheSpan = (probeStored = null == _globalThis.window ? void 0 : _self.Object)?.keys({});
let keyStored;
export const seKeyInsideTheSpan = null == (keyStored = null == (c++, _globalThis).window ? void 0 : (k++, _self).Number) ? void 0 : _Number$isInteger(1);
let plainStored;
export const plainSpanLandsWhole = null == (plainStored = _self.window?.Array) ? void 0 : _Array$of(4);
export { c, k, root };