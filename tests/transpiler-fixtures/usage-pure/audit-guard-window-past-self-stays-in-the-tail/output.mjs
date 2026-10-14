import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a run landing on the backed `self` keeps the unbacked `window` read above it as the guard test,
// and a `window` past `self` stays in the alternate where a later `?.` still reads it: an absent
// window skips the chrome read, an absent chrome skips the next one. plain continuations past that
// `window` keep their native throw.
const ut = () => _globalThis;
export const plannedTailKeepsGuard = (null == ut().window ? void 0 : _self.window)?.chrome?.Array;
const rt = () => _globalThis;
export const renderTailPlainContinuation = null == rt().window ? void 0 : _self.window.chrome;
export const renderTailFirstOptionalFolds = (null == rt().window ? void 0 : _self.window)?.chrome;
export const renderTailDeepPlain = null == rt().window ? void 0 : _self.window.chrome.foo;