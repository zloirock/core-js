// Spreads retain native array iteration and static wrapper reads.
// Instance leaves before a spread use a known element; shifted leaves dispatch on the runtime element.
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
// The array wrapper keeps both native constructor hops and its spread iteration.
const [{ AggregateError: { customZ }, Object: { keys: anchoredBeside } }] = [globalThis, ...xs];
export { getPrototypeOf, freeze, seal, sibling, isFrozen, inlineSurface, viaCall, viaMember, behindSpread, slotBehindSpread, customZ, anchoredBeside, seen, kw };
