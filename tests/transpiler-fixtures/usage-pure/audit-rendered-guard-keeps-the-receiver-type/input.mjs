// A rendered quiet realm guard keeps its receiver type.
// A stored effectful realm key retains its source read and independent instance claim.
let v, g, out;
function eff() {}
out = (eff(), globalThis.window?.self).Array.prototype.at.name;
export const stored = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Array.prototype.at.name;
export const read = out;
