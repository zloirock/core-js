import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Only the hop read straight off the root can be absent, so only it earns the guard, and only where
// the `?.` right above it reads it: the realm hops repeated past it are self-references, whatever
// spells the root. The value a kept write stores is still the one tested, and a `delete` keeps the
// guard deciding whether it lands.
const g = _globalThis;
const f = () => _globalThis;
let e = 0;
let held;
export const direct = null == _globalThis.window ? void 0 : _self.box;
export const viaSelf = null == _self.window ? void 0 : _self.cfg;
export const viaAlias = null == g.window ? void 0 : _self.api;
export const viaCall = null == f().window ? void 0 : _self.list;
export const viaSequence = (e++, null == _globalThis.window ? void 0 : _self.mode);
export const stored = null == (held = _globalThis.window?.window) ? void 0 : _Array$of(1);
export const removed = null == _self.window ? true : delete _self.slot;