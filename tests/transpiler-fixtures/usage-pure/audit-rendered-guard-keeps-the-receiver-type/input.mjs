// the receiver's TYPE has to survive the guard render. an emitter that re-visits its own output asks
// the question a second time, and both spellings the render leaves are ones the raw shape checks miss:
// the probe ternary whose defined branch holds the collapsed surface, and the plugin-minted memo whose
// value is a proxy surface reached through a COMPUTED hop key. either one lost turns a provably Array
// receiver into the generic instance helper - on one leg only
let v, g, out;
function eff() {}
out = (eff(), globalThis.window?.self).Array.prototype.at.name;
export const stored = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Array.prototype.at.name;
export const read = out;
