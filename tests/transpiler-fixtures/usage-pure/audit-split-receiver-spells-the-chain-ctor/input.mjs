// A split receiver retains its environment probe and selects a known constructor from its pure import.
// The computed key stays on the tail; its unwritten local binding needs no static namespace.
// The direct static sibling is served independently.
let v, g, out, k;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise[k].at.name;
export const read = out;
export const race = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise.race([]);
