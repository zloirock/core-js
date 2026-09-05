import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// DOUBLE-paren-wrapped assignment as the root of an optional proxy chain. the store holds a defined
// realm alias, so the guard erases and the assignment rides the collapsed receiver - where the reprint
// must spell it BARE (`n = gw`), never with a leftover paren: a paren nest bottoming out at a plain
// expression peels FULLY. the single-paren line is the control the doubled ones have to match.
// a `.name` tail keeps the read receiver-independent; distinct ctor + method per line
let n, s, w;
const gw = _globalThis;
export const doubleMapHas = _nameMaybeFunction((n = gw, _Map).prototype.has);
export const doubleSetAdd = _nameMaybeFunction((s = gw, _Set).prototype.add);
export const singleWeakGet = _nameMaybeFunction((w = gw, _WeakMap).prototype.get);