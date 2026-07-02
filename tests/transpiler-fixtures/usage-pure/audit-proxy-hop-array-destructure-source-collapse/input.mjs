// An ARRAY-destructure SOURCE reads its receiver by index / iteration, never a named static the
// destructure-emitter could synth-swap - so the emitter never OWNS the chain. its proxy hop must still
// collapse (`globalThis.self.Array` -> `_globalThis.Array`) via the natural global rewrite, else a
// residual `_globalThis.self.Array` reads an undefined `.self` hop off-engine (ie:11 / Node). covers a
// bare lone element, a multi-element list, a multi-hop, an SE-prefixed init, and an assignment-pattern
// LHS. a pure-ctor leaf (`Map`) whole-swaps to its pure import instead - the no-over-collapse control.
const [ arrEl ] = globalThis.self.Array;
const [ a, b ] = globalThis.self.Array;
const [ winEl ] = globalThis.self.window.Array;
function eff() {}
const [ seEl ] = (eff(), globalThis.self.Array);
let assignEl;
[ assignEl ] = globalThis.self.Array;
const [ mapEl ] = globalThis.self.Map;
export { arrEl, a, b, winEl, seEl, assignEl, mapEl };