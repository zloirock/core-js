import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let x;
let c = 0;
export { c };
// NEGATIVES for the tail classification. a sequence value whose tail is UNGROUNDED keeps its live guard
// and its raw value; a tail that is no proxy at all keeps the `.self` untouched too - that `.self` is a
// property of the user's own object, not a hop
let n;
export const seqWindowTail = null == (n = (c++, _globalThis.window)) ? void 0 : _findIndexMaybeArray(n.Array.prototype).call([1], x => x);