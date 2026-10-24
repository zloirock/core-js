// a ternary receiver whose BRANCH carries an effect must never be discarded whole by the
// flatten: a branch-buried effect is conditional, so the collapse bails to the per-branch
// mirror and the effect survives on exactly its native path

// a chain assignment in a branch keeps its write (the assigned alias maps to the pure root)
let c1 = Math.random() < 0.5;
let q;
let x1 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = c1 ? (q = globalThis) : x1;
export const viaChainAssign = iterFrom([1].values());
