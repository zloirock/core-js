// a deeper nav under a non-proxy leaf chain with a CALL root: the receiver plan's member
// recursion must reach the call-rooted collapse exactly like the identifier-rooted twin
// (`_globalThis.foo`), never leave the raw `.window` hop standing over the inlined call
typeof (() => globalThis)().window.foo[Symbol.iterator];
typeof (() => globalThis)().window.foo?.[Symbol.iterator];
typeof globalThis.window.foo?.[Symbol.iterator];
// boundary forms of the same collapse: an SE-bearing computed hop key keeps its effect as the
// collapsed base's prefix, and a computed user leaf keeps its own spelling over the folded base
let c = 0;
typeof (() => globalThis)()[(c++, 'window')].foo?.[Symbol.iterator];
typeof (() => globalThis)()[(c++, 'window')]['foo-bar']?.[Symbol.iterator];

// a claimless nav on a DEFINED-yield call root collapses onto the ROOT ponyfill - the
// identifier twin's canon - with a sequence prefix re-emitted ahead of the base; the
// PROBE-yield twin keeps the leaf collapse (its value never reached the root), and an
// effect-bearing call keeps the leaf too - the fold has no slot to replay what it did
export const viaDefinedCallRoot = (() => globalThis)().window.self.userSlot;
export const viaDefinedCallRootClaim = (() => globalThis)().window.self.Array.of(3);
let sq = 0;
export const viaSeqDefinedCallRoot = (sq++, (() => globalThis)()).window.self.userSlot;
export { sq };
const dhProbeYield = () => globalThis.window;
export const viaProbeYieldPlainNav = dhProbeYield().self.userSlot;
export const viaIdentRootTwin = globalThis.window.self.userSlot;
let se = 0;
const dhSeYield = () => { se++; return globalThis; };
export const viaEffectfulCallRoot = dhSeYield().window.self.userSlot;
export { se };
