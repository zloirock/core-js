let c = 0;
const g = globalThis;

// alias proxy root buried under a root side-effect sequence, pure-CTOR leaf: the whole nav whole-swaps
// to the pure ctor and harvests the effect (`(c++, g).self.Map` -> `c++, _Map`), not re-emitting the
// raw `.self` hop off the alias (undefined off-engine)
const { groupBy: viaRootSeCtor } = (c++, g).self.Map;
export const a = viaRootSeCtor;

// alias root, root side-effect, NON-ctor leaf: the alias identifier stays and only the redundant hop drops
const { from: viaRootSeStatic } = (c++, g).self.Array;
export const b = viaRootSeStatic;

// alias root with the side-effect buried in the hop TAIL, pure-ctor leaf: the ctor whole-swap sees
// through the tail sequence and collapses the same way
const { allSettled: viaTailSeCtor } = (c++, g.self).Promise;
export const d = viaTailSeCtor;

// alias root with the effect buried in the hop TAIL, NON-ctor leaf: the discarded residual is ownerless
// (no competing instance-dispatch rewrite), so the redundant hop still drops off the kept alias name
const { of: viaTailSeStatic } = (c++, g.self).Array;
export const e = viaTailSeStatic;
