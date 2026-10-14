import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A sequence the probe navigation is rooted in runs its prefix first and exactly once, whatever
// renders the guard: ahead of the test for a `delete` and a sealed read, never a second time inside
// the branch when the root itself is the probe (an alias of its value, a bare name), and never after
// the test, where a short-circuit would skip it.
let e = 0;
const A = _globalThis.window;
export const removed = (e++, null == _globalThis.window ? true : delete _self.box.k);
export const sealed = (e++, null == _self.window ? void 0 : _self).box.list;
export const viaAlias = (e++, null == A ? void 0 : _self.cfg.mode);
export const viaBare = typeof (e++, null == window ? void 0 : _self.api);
export const dropped = (e++, null == A ? true : delete _self.box);