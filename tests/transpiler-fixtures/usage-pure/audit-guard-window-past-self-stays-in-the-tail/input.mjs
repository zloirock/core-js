// a run landing on the backed `self` keeps the unbacked `window` read above it as the guard test,
// and a `window` past `self` stays in the alternate where a later `?.` still reads it: an absent
// window skips the chrome read, an absent chrome skips the next one. plain continuations past that
// `window` keep their native throw.
const ut = () => globalThis;
export const plannedTailKeepsGuard = ut()?.window?.self?.window?.chrome?.Array;
const rt = () => globalThis;
export const renderTailPlainContinuation = rt()?.window?.self.window.chrome;
export const renderTailFirstOptionalFolds = rt()?.window?.self?.window?.chrome;
export const renderTailDeepPlain = rt()?.window?.self.window.chrome.foo;
