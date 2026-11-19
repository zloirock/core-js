// A stored effectful realm read keeps its computed tail and independent instance dispatch.
let v, g, out, k;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise[k].at.name;
export const read = out;
export const race = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise.race([]);
