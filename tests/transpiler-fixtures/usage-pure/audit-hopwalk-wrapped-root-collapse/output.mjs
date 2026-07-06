import _globalThis from "@core-js/pure/actual/global-this";
// the emit-side hop-collapse climbs UP from the root identifier while the detection canon walks
// DOWN peeling transparent wrappers, sequence tails and chain-assignments - the two walks must
// stay in lockstep. a wrapper the descent peels but the climb could not step over stranded the
// redundant `.self` hop on the emitted receiver (an undefined read off the pure root off-engine):
// a sequence-tail root (SE prefix stays, hop drops), a parenthesized root, a mixed
// sequence-then-assign root, and an aliased root under each wrapper (the alias keeps its
// identifier and only drops the hops). distinct non-pure leaves per line expose which line
// regressed; the counters prove the prefix effects survive in source order.
let e = 0,
  f = 0,
  q,
  r,
  s,
  t;
const g = _globalThis;
export const seqRoot = (e++, _globalThis).Math;
export const seqInAssignRoot = (r = (e++, _globalThis), _globalThis).Intl;
export const aliasSeqInAssign = (s = (f++, g), g).WeakRef;
export const deepInterleaved = (t = q = (0, _globalThis), _globalThis).Math.max(1, 2);
export const parenRoot = _globalThis.JSON;
export const seqAssignRoot = (f++, q = _globalThis, _globalThis).Date;
export const aliasSeqRoot = (e++, g).Number;
export const aliasParenRoot = g.Atomics;