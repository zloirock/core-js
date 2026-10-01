import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// A plain realm run ending at backed self stores the always-defined ponyfill, directly or through an alias.
// A store of the terminal window probe preserves its value and keeps the optional continuation guarded.
let w, v, u;
const folded = _self;
export const overStore = (w = folded, _Array$of)(1);
// NEGATIVE: an alias of a TERMINAL probe read holds a value that can be absent and keeps its guard
const probe = _self.window;
export const overProbeStore = null == (v = probe) ? void 0 : _Array$of(2);
// The direct backed form reaches the same defined self value and preserves its store.
export const overDirectStore = (u = _self, _Array$of)(3);