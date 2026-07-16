import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
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
export const templateHole = `${ null == (_ref2 = t = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype).call([1], 1) }`;

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
export const ofSynthKept = (({ of } = {}) => of)((ks = _globalThis.window, c2++, { of: _Array$of }));
export { c2 };
// NEGATIVES for the synth-claim yield: the same kept+SE-key chain in a LOGICAL and a TERNARY carrier
// with NO pending synth - the drive still owns the collapse (nothing claimed the receiver)
let c3 = 0;
let ln;
export const logicalNoSynth = ((ln = _globalThis.window)?.[c3++, "Array"] ?? Array).from([1]);

let tn;
export const ternaryNoSynth = (1 ? null == (_ref3 = tn = _globalThis.window) ? void 0 : _findLastMaybeArray(_ref3[c3++, "Array"].prototype) : 0).call([1, 2], v => v < 2);
export { c3 };

// A destructure SOURCE over the kept chain: the pattern is claimed by the extraction pipeline, but
// that pipeline renders a kept source verbatim (its own collapse entry gates off once the natural
// root rewrite lands), so the hop-collapse drive must NOT defer to it here - the migrated span
// composes into the extracted source by needle. resolvable navigations still defer (the pipeline
// owns those atomically).
let c4 = 0;
let ds;
export const { indexOf: idxOfKept } = ((ds = _globalThis.window)?.[c4++, "Array"].prototype) ?? {};
export { c4 };

// A BARE proxy root under two dead proxy-hop optionals: the root is always defined, so every guard
// is dead and the whole navigation collapses with no memo at all.
export const bareDoubleOptional = _flatMaybeArray(_globalThis.Array.prototype).call([2, [3]]);

// An optional CALL between the hops is not a member hop: the dead-hop descent must not claim it -
// the value lands on the ponyfilled global and the call guard dies by that substitution.
let oc = 0;
let cb;
export const optionalCallHop = () => (cb = _globalThis.window, oc++, _self)().Array;
export { oc };

// An ALIAS-carried kept root under two live-looking optionals: one memo at the root, keys migrate.
const galias = _globalThis;
let alk;
export const aliasDoubleOptional = null == (_ref4 = alk = galias.window) ? void 0 : _atMaybeArray(_ref4[c3++, "Array"].prototype).call([7], 0);

// NEGATIVE: an ordinary (non-proxy) double-optional chain keeps its leaf-nearest memo anchor -
// the inner `?.` lives inside the memoized expression, which is exactly its short-circuit meaning.
const holder = { p: { q: [4, [5]] } };
export const ordinaryDoubleOptional = null == (_ref5 = holder.p?.q) ? void 0 : _findLastIndexMaybeArray(_ref5).call(_ref5, v => Array.isArray(v));

// The ASSIGNMENT form of a destructure over the kept chain: same ownership rule as the declarator -
// the extraction claims the pattern, the drive still collapses the kept source under it.
let mapOfKept;
let asg;
mapOfKept = _mapMaybeArray(((asg = _globalThis.window)?.[c4++, "Array"].prototype) ?? {});
export { mapOfKept };

// A NESTED pattern over the kept chain: the outer pattern is the claimed one; the source still
// collapses once, feeding both levels.
let nst;
export const { constructor: { of: ofNested } = {} } = ((nst = _globalThis.window)?.[c4++, "Array"].prototype) ?? {};