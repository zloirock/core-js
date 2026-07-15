import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// SIDE-EFFECT ordering around a KEPT proxy root (a chain-assign the collapse may not root through, because
// its value navigates a hop core-js does not ponyfill). the root re-emits itself, so it must not ALSO be
// harvested as an effect - but everything else around it must still run, exactly once, in source order.
// each line puts the effect somewhere different: inside the assigned value, in a sequence around the
// assignment, in a computed hop key, and on both sides at once. distinct methods per line.
let c = 0;

let a;
export const effectInsideValue = _flatMaybeArray((a = (c++, _globalThis.window)).Array.prototype).call([1, [2]]);

let b;
export const effectAroundAssign = null == (_ref = (c++, b = _globalThis.window)) ? void 0 : _atMaybeArray(_ref.Array.prototype).call([1], 0);

let d;
export const effectInHopKey = null == (_ref2 = d = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2[(c++, 'self')].Array.prototype).call([1], 1);

let e;
export const effectBothSides = null == (_ref3 = (c++, e = _globalThis.window)) ? void 0 : _findLastMaybeArray(_ref3[(c++, 'self')].Array.prototype).call([1], x => x);

export { c };

// NEGATIVES for the tail classification. a sequence value whose tail is UNGROUNDED keeps its live guard
// and its raw value; a tail that is no proxy at all keeps the `.self` untouched too - that `.self` is a
// property of the user's own object, not a hop
let n;
export const seqWindowTail = null == (_ref4 = n = (c++, _globalThis.window)) ? void 0 : _findIndexMaybeArray(_ref4.Array.prototype).call([1], x => x);

const plain = { self: { Array } };
let m;
export const seqPlainTail = (m = (c++, plain))?.self.Array.prototype.indexOf.call([1], 1);

// nested SE prefixes around a ponyfilled tail all survive, in source order, and the guard is dead
let k;
export const nestedSeqPony = _flatMapMaybeArray((k = (c++, (c++, _self)), _globalThis).Array.prototype).call([1], x => [x]);