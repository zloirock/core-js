import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _self from "@core-js/pure/actual/self";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let x;
let c = 0;
export { c };
// nested SE prefixes around a ponyfilled tail all survive, in source order, and the guard is dead
let k;
export const nestedSeqPony = _flatMapMaybeArray((k = (c++, c++, _self), _self).Array.prototype).call([1], x => [x]);