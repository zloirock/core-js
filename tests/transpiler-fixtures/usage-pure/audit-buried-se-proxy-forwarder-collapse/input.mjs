// a side-effect prefix BURIED one hop below a static / forwarder member (`(eff(), globalThis.self).Array
// .from`) leaves the inner proxy-global leaf inside a separately-walked sequence: the marking descent must
// peel to the sequence tail so the leaf is suppressed, else the unplugin member visitor queues a parallel
// `globalThis.self -> _globalThis` rewrite the outer static collapse cannot compose -> hard crash (babel is
// benign: it re-emits then drops the consumed subtree). an IIFE-ROOTED buried chain (`(0, (() =>
// globalThis)().self).Math`) needs the same: the subsumption walk must peel the buried sequence to reach
// the IIFE root and mark it (a pure IIFE drops; an effectful prefix/IIFE is preserved and re-emitted).
// covers static-call / static-property / symbol-key (direct + DEEP-hop SE under a proxy hop) /
// IIFE-rooted-forwarder / IIFE-tail-with-effect-prefix. the deep-hop symbol-key effect sits BELOW the
// `.self` hop, so it must be harvested by the full chain descent, not a single-level sequence peel
let eff = () => 0;
const obj = {};
export const a = (eff(), globalThis.self).Array.from([1, 2]);
export const b = (eff(), globalThis.self).Number.MAX_SAFE_INTEGER;
export const c = obj[(eff(), globalThis.self).Symbol.iterator];
export const d = (0, (() => globalThis)().self).Math.trunc(1.5);
export const e = (eff(), (() => globalThis)()).Array.of(1, 2);
export const f = obj[(eff(), globalThis).self.Symbol.asyncIterator];
