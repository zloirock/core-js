import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// an optional proxy chain whose root STORES a defined realm value: the `?.` guards the store's result,
// which is that value, so the guard is dead whichever way the root is spelled - a sequence with an
// assignment tail, a bare chain-assign, a sequence with no assignment at all. all three erase and fold
// their effects (`c++`, `e++`, the assign) exactly ONCE into the collapsed receiver; a second fold
// would double-run them. the value here is an ALIAS of the realm, which answers as its literal does.
// distinct ctor + method per line
let n, c, a, e;
const gw = _globalThis;
export const seqAssign = _nameMaybeFunction((c++, n = gw, _Map).prototype.has);
export const chainAssign = _nameMaybeFunction((a = gw, _Set).prototype.add);
export const noAssign = _nameMaybeFunction((e++, _WeakMap).prototype.get);
export { c, e };