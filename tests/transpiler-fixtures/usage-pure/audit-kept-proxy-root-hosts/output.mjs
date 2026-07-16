import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// the HOST positions a kept proxy root can sit in. the rule is the same everywhere - the assignment stays
// as the root, its redundant proxy hops still drop - but each host reaches the collapse through its own
// emit path, so each has to be pinned separately: a `new` callee, a write target, a logical operand, a
// discarded for-x head, a template hole, and a spread argument. distinct methods / constructors per line.
let n;
export const newCallee = new (n = _globalThis.window).Array(3);
let w;
(w = _globalThis.window, _self).Set = function () {};
let l;
export const logicalOperand = (null == (_ref = l = _globalThis.window) ? void 0 : _flatMapMaybeArray(_ref.Array.prototype)) || {};
let f;
for (const k in (f = _globalThis.window)?.Array.prototype ?? {}) void k;
let t;
export const templateHole = `${null == (_ref2 = t = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype).call([1], 1)}`;
let s;
export const spreadArg = Math.max(...((s = _globalThis.window)?.Array.from?.([1, 2]) ?? [0]));
let d;
delete (d = _globalThis.window, _self).someUserKey;
export { w };

// an IIFE-arg SYNTH over a kept+SE-key chain: the swap renders the whole receiver (its own harvest),
// so the hop-collapse drive must yield to the claim - queueing its migrated span too nested a transform
// the swap's content could not compose (a build break)
let c2 = 0;
let ks;
export const ofSynthKept = (({
  of
} = {}) => of)((ks = _globalThis.window, c2++, {
  of: _Array$of
}));
export { c2 };
// NEGATIVES for the synth-claim yield: the same kept+SE-key chain in a LOGICAL and a TERNARY carrier
// with NO pending synth - the drive still owns the collapse (nothing claimed the receiver)
let c3 = 0;
let ln;
export const logicalNoSynth = ((ln = _globalThis.window)?.[c3++, "Array"] ?? Array).from([1]);
let tn;
export const ternaryNoSynth = (1 ? null == (_ref3 = tn = _globalThis.window) ? void 0 : _findLastMaybeArray(_ref3[c3++, "Array"].prototype) : 0).call([1, 2], v => v < 2);
export { c3 };