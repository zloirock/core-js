// BOTH branches chain-assign to the proxy: each write survives on its native path, sequenced ahead
// of a per-branch mirror that serves the static - both emitters agree
let c5 = Math.random() < 0.5;
let q5, w5;
const { Object: { fromEntries: objFromEntries } } = c5 ? (q5 = globalThis) : (w5 = globalThis);
export const viaDualChain = objFromEntries([["k", 1]]);
