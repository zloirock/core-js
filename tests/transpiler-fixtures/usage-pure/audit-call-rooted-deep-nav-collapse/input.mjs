// Call-rooted quiet navigation retains its existing collapse. Effectful realm keys stay native, including under a symbol receiver.
typeof (() => globalThis)().window.foo[Symbol.iterator];
typeof (() => globalThis)().window.foo?.[Symbol.iterator];
typeof globalThis.window.foo?.[Symbol.iterator];
let c = 0;
typeof (() => globalThis)()[(c++, 'window')].foo?.[Symbol.iterator];
typeof (() => globalThis)()[(c++, 'window')]['foo-bar']?.[Symbol.iterator];

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
