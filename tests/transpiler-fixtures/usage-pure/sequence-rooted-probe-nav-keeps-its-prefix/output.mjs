import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A sequence the probe navigation is rooted in runs its prefix first and exactly once, whatever
// renders the guard: inside the probe for a direct navigation, ahead of the guard when the root
// itself is the probe (an alias of its value, a bare name), and never in the branch, where a
// short-circuit would skip it. A delete keeps the same order as an ordinary read.
let e = 0;
const A = _globalThis.window;
export const removed = null == (e++, _globalThis.window) ? true : delete _self.box.k;
export const sealed = (null == (e++, _self.window) ? void 0 : _self).box.list;
export const viaAlias = (e++, null == A ? void 0 : _self.cfg.mode);
export const viaBare = typeof (e++, null == window ? void 0 : _self.api);
export const dropped = (e++, null == A ? true : delete _self.box);