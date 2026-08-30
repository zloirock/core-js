// a proxy nav that NO claim leads: every guard render here is driven by a claim, and a navigation
// whose leaf polyfills nothing has none, so the entry has to be its own. a run carrying a live `?.`
// owes the guard - bailing on it left the hops raw, a native `self` read where the ponyfill is the
// point - in every position, and a claim LEADING the channel must render exactly that same guard.
let assigned;
export const guardedRun = (() => globalThis)().window?.self.noSuchStatic;
assigned = (() => globalThis)().window?.self.noSuchStatic;
export const claimedTwin = (() => globalThis)().window?.self.Array.of(3);
// the tail the guard's alternate carries answers the shared vestigial verdict: its `?.` reads the
// always-defined ponyfill the alternate landed, so it is dead text
const held = globalThis;
export const tailOverLeaf = held.window?.self?.window.noSuchStatic;
// ... and through a SEQUENCE standing around the navigation: its prefix runs beside the nav, and
// the render lands in the tail's own slot instead of replacing the sequence whole
let effects = 0;
export const sequenceAround = (effects++, globalThis.window?.self).noSuchStatic;
export { effects };
export { assigned };
