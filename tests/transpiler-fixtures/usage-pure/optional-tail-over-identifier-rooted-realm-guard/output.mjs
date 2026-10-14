import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A guard over a realm claim reached from an identifier or call root renders the always-defined
// ponyfill, so its tail pulls in by the rule the direct root follows: the `?.` reading the ponyfill
// folds in, the next one stays outside on the guard's own value - for a call, an optional call and a
// sealed read alike, whichever name holds the root. A `delete` still takes the guard whole.
const g = _globalThis;
const s = _self;
const A = _globalThis.window;
const f = () => _globalThis;
export const bare = (null == window ? void 0 : _self.box)?.k;
export const realm = (null == g.window ? void 0 : _self.cfg)?.opts?.depth;
export const viaSelf = (null == s.window ? void 0 : _self.api)?.run();
export const held = (null == A ? void 0 : _self.api)?.stop?.();
export const called = (null == f().window ? void 0 : _self.box)?.list;
export const sealed = ((null == A ? void 0 : _self.cfg)?.opts).depth;
export const viaThis = (null == g.window ? void 0 : _globalThis.cfg)?.mode;
export const removed = null == g.window ? true : delete _self?.box?.k;