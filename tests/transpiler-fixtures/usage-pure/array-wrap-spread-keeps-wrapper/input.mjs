// A spread preserves array iteration and the positions it can affect.
// Known static slots receive pure values while uncertain slots retain their native reads.
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
// a leaf off a ctor the targets may lack re-anchors on the ponyfilled ctor as a declarator of its own,
// and the wrapper's husk keeps only the sentinel of a hop the realm always carries
const [{ AggregateError: { customZ }, Object: { keys: anchoredBeside } }] = [globalThis, ...xs];
export {
  getPrototypeOf,
  freeze,
  seal,
  sibling,
  isFrozen,
  inlineSurface,
  viaCall,
  viaMember,
  behindSpread,
  slotBehindSpread,
  customZ,
  anchoredBeside,
  seen,
  kw,
};
