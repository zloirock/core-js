// a ternary receiver whose BRANCH carries an effect must never be discarded whole by the
// flatten: a branch-buried effect is conditional, so the collapse bails to the per-branch
// mirror and the effect survives on exactly its native path

// a chain assignment in a branch keeps its write (the assigned alias maps to the pure root)
let c1 = Math.random() < 0.5;
let q;
let x1 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = c1 ? (q = globalThis) : x1;
export const viaChainAssign = iterFrom([1].values());

// a chain assignment wrapping a logical fallback keeps both the write and the fallback
let c2 = Math.random() < 0.5;
let w, m = null;
let x2 = { Array: { from: v => v } };
const { Array: { from: arrayFrom } } = c2 ? (w = (m || globalThis)) : x2;
export const viaChainLogical = arrayFrom([1, 2]);

// a sequence prefix in a branch runs only on that branch - the mirror keeps it in place
let c3 = Math.random() < 0.5;
let eff = () => {};
const { Map: { groupBy: mapGroupBy } } = c3 ? (eff(), globalThis) : globalThis;
export const viaSeqPrefix = mapGroupBy([1, 2], v => v % 2);

// an IIFE body effect in a branch stays conditional - the mirror swaps the returned leaf
let c4 = Math.random() < 0.5;
let hits = 0;
const { Object: { groupBy: objGroupBy } } = c4 ? (() => { hits++; return globalThis; })() : globalThis;
export const viaIifeBody = objGroupBy([1, 2], v => v % 2);

// BOTH branches chain-assign to the proxy: writes survive on their native paths and the
// leaf takes the sound inline default (fires only when the selected global's static is
// genuinely absent) - both emitters agree
let c5 = Math.random() < 0.5;
let q5, w5;
const { Object: { fromEntries: objFromEntries } } = c5 ? (q5 = globalThis) : (w5 = globalThis);
export const viaDualChain = objFromEntries([["k", 1]]);
