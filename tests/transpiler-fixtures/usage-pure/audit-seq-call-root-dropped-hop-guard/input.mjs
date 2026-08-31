// a dropped backed hop under a live `?.` whose base is a PROVEN named call (bare or behind an
// effect-free sequence): the `?.` is dead, so the memo folds straight onto the ponyfill,
// keeping only what the base observably did - the seq-prefix effects, and the call itself when
// its body or arguments carry any. the kept-write question is the chain-assign canon's `outer`
// answer: the identity spelling read the peeled sequence as a write and lost `_self` outright
const dh = () => globalThis;
export const seq = (0, dh())?.self?.window.Array.of(1).at(0);
export const bare = dh()?.self?.window.Array.of(1).at(0);
let c = 0;
const eff = () => { c++; return globalThis; };
export const seCallee = eff()?.self?.window.Array.of(1).at(0);
export const seArg = dh(c++)?.self?.window.Array.of(1).at(0);
export const sePrefix = (c++, dh())?.self?.window.Array.of(1).at(0);
// negative: a call yielding the environment PROBE proves WHICH global, not that it is
// defined - its `?.` stays load-bearing and the guard render survives
const dw = () => globalThis.window;
export const probeYield = dw()?.self?.window.Array.of(1)?.at(0);
