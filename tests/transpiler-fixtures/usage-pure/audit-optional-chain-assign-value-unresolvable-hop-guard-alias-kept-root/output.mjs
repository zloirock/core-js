import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
// A guarded instance call owns the rendering of its alias-rooted proxy store. The alias hop must compose into that rendering
// without a second overlapping rewrite.
const g = _globalThis;
let t;
export const aliasKeptRoot = _findLastMaybeArray((t = g.window).Array.prototype).call([1, 2], x => x < 2);