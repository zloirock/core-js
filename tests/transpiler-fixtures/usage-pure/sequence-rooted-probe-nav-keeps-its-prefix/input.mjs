// A sequence the probe navigation is rooted in runs its prefix first and exactly once, whatever
// renders the guard: inside the probe for a direct navigation, ahead of the guard when the root
// itself is the probe (an alias of its value, a bare name), and never in the branch, where a
// short-circuit would skip it. A delete keeps the same order as an ordinary read.
let e = 0;
const A = globalThis.window;
export const removed = delete (e++, globalThis.window)?.self.box.k;
export const sealed = ((e++, self.window)?.self).box.list;
export const viaAlias = (e++, A)?.self.cfg.mode;
export const viaBare = typeof (e++, window)?.self.api;
export const dropped = delete (e++, A)?.self.box;
