// a SPREAD after the slot keeps the wrapper alive because no statement re-emits an iteration:
// a receiver-less static leaves a leaf sentinel, its prefix lifts, a write stays, a live sibling
// needs no sentinel; a reading claim on a re-readable element reads inline beside the residual,
// and one on an element that is not re-readable takes the positional slot instead of a ref and a
// husk; a spread BEFORE the slot leaves that slot to the positional pair too
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
