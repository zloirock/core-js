// A sequence the probe navigation is rooted in runs its prefix first and exactly once, whatever
// renders the guard: ahead of the test for a `delete` and a sealed read, never a second time inside
// the branch when the root itself is the probe (an alias of its value, a bare name), and never after
// the test, where a short-circuit would skip it.
let e = 0;
const A = globalThis.window;
export const removed = delete (e++, globalThis.window)?.self.box.k;
export const sealed = ((e++, self.window)?.self).box.list;
export const viaAlias = (e++, A)?.self.cfg.mode;
export const viaBare = typeof (e++, window)?.self.api;
export const dropped = delete (e++, A)?.self.box;
