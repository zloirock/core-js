// A guarded instance call owns the rendering of its alias-rooted proxy store. The alias hop must compose into that rendering
// without a second overlapping rewrite.
const g = globalThis;
let t;
export const aliasKeptRoot = (t = g.window).self.Array.prototype.findLast.call([1, 2], x => x < 2);
