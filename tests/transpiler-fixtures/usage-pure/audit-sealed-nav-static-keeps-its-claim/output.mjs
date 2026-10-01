import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a STATIC below the chain end owns the chain exactly as a global-named key does: asked by global name
// alone (`MAX_SAFE_INTEGER` names no global) the walk answered nothing, the guard render took the
// navigation and the static stayed NATIVE off the ponyfill - `_self.Number.MAX_SAFE_INTEGER` reads
// undefined on the engines the entry exists for, and no import lands. the SEAL is what puts the static
// below the end: unsealed, the same source is one chain and its own channel claims it.
// the instance twin is the negative - `at` resolves to an INSTANCE helper, whose channel renders its
// own receiver, and claiming the chain here would leave the navigation raw
let out;
function eff() {}
const ga = _globalThis;
out = ((null == ga.window ? void 0 : _self).Number, _Number$MAX_SAFE_INTEGER).name;
export const unsealed = null == ga.window ? void 0 : _Number$MAX_SAFE_INTEGER.name;
export const instanceTwin = _atMaybeArray((eff(), null == _globalThis.window ? void 0 : _self).Array.prototype).Math;
export const read = out;