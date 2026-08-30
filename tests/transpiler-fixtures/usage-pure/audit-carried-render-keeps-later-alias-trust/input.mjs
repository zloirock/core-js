// a render that REPLACES a subtree while carrying a kept alias write must not cost the alias its
// trust at LATER reads: the write's cached ancestry died with the replaced span, and a placement
// judged over those dead edges refused the very trust the write still earns - the second statement
// then kept its store raw where the same statement alone collapses it
let v, g, w, out;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')].self)?.window.noSuchStatic;
export const laterRead = (g = globalThis, w = g.self)?.Array.prototype.at;
export { v, w, out };
