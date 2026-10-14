// A spread keeps its array wrapper, and the iteration with it. A slot ahead of the spread is known:
// a static there is served by a literal in the slot, an instance leaf dispatches on the element the
// wrapper captured. A slot behind the spread may hold any element, so its hops read natively and its
// instance leaf takes the generic dispatch.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const f = () => [1];
const o = { b: [1] };
const [{ Object: { getPrototypeOf } }] = [(eff('i'), globalThis), ...xs];
const [{ Object: { freeze } }] = [kw = (eff('j'), globalThis), ...xs];
const [{ Object: { seal }, sibling }] = [globalThis, ...xs];
const [{ isFrozen }] = [(eff('k'), Object), ...xs];
const [{ at: inlineSurface }] = [globalThis.Array.prototype, ...xs];
const [{ at: viaCall }] = [f(), ...xs];
const [{ at: viaMember }] = [o.b, ...xs];
const [, { Array: { prototype: { at: behindSpread } } }] = [...xs, globalThis];
const [, { at: slotBehindSpread }] = [...xs, [6, 7]];
// a hop to a constructor the targets may lack takes its ponyfill in the slot's literal, so a leaf
// that is no static of it reads undefined there instead of throwing
const [{ AggregateError: { customZ }, Object: { keys: anchoredBeside } }] = [globalThis, ...xs];
export { getPrototypeOf, freeze, seal, sibling, isFrozen, inlineSurface, viaCall, viaMember, behindSpread, slotBehindSpread, customZ, anchoredBeside, seen, kw };
