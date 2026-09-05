// READING claims beside a neighbour: a built-in surface re-spells inline beside the residual a
// spread keeps (no memo hoists it ahead of the iteration), lifts its trailing neighbour and drops
// the wrapper where nothing else keeps it, an effectful computed key keeps its sentinel residual
// beside the memo, a leaf the hops merely reach by name stays native, and a re-readable element
// memoizes only where a BOUND neighbour keeps its residual
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ Array: { prototype: { flat: viaSurface } } }] = [globalThis, ...xs];
const [{ Array: { prototype: { at: viaLifted } } }] = [globalThis, eff('v')];
const [{ [(eff('u'), 'at')]: viaKey }] = [Array.prototype, ...xs];
const [{ Array: { keys: nameMatch } }] = [globalThis, ...xs];
// a BOUND neighbour keeps the residual for its own sake, so the surface it re-reads memoizes even
// beside an effect; the effect alone keeps nothing, and the surface reads inline
const [{ at: memoBeside }, boundBeside] = [globalThis.Array.prototype, eff('ad')];
const [{ at: inlineBesideEffect }] = [globalThis.Array.prototype, eff('ae')];
export { viaSurface, viaLifted, viaKey, nameMatch, memoBeside, boundBeside, inlineBesideEffect, seen };
