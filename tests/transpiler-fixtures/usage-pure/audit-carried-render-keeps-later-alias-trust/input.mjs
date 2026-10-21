// A retained effectful realm read must not invalidate a later independent alias claim.
let v, g, w, out;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')].self)?.window.noSuchStatic;
export const laterRead = (g = globalThis, w = g.self)?.Array.prototype.at;
export { v, w, out };
