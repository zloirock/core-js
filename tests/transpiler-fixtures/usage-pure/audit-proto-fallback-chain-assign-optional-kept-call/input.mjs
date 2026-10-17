// a call tail with NO polyfillable meta above the fallback still keeps the root guard: the
// fold ate it before (`(c = gw, _Set).prototype.has.call(x)` returned a live value where
// native short-circuits to undefined on the absent window)
let c;
export const optionalKeptCall = (c = globalThis.window)?.self.Set.prototype.has.call(new Set([1]), 1);
