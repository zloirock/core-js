// a STATIC below the chain end owns the chain exactly as a global-named key does: asked by global name
// alone (`MAX_SAFE_INTEGER` names no global) the walk answered nothing, the guard render took the
// navigation and the static stayed NATIVE off the ponyfill - `_self.Number.MAX_SAFE_INTEGER` reads
// undefined on the engines the entry exists for, and no import lands. the SEAL is what puts the static
// below the end: unsealed, the same source is one chain and its own channel claims it.
// the instance twin is the negative - `at` resolves to an INSTANCE helper, whose channel renders its
// own receiver, and claiming the chain here would leave the navigation raw
let out;
function eff() {}
const ga = globalThis;
out = (ga.window?.self).Number.MAX_SAFE_INTEGER.name;
export const unsealed = ga.window?.self.Number.MAX_SAFE_INTEGER.name;
export const instanceTwin = (eff(), globalThis.window?.self).Array.prototype.at.Math;
export const read = out;
