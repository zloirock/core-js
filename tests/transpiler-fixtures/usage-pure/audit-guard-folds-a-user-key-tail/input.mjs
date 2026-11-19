// steps past the planned run (non-proxy names) read off the value the guard's alternate produces:
// while that value is provably defined they move INSIDE the alternate - plain steps and the first
// `?.` alike, so no `?.` is left for an ES5 lowering to memoize - and a later live `?.` stays outside,
// over the ternary. a computed key without effects folds like any other step.
const ut = () => globalThis;
export const unplannedOptionalTail = ut()?.window?.self?.chrome?.Array.of(13).at(0);
export const unplannedPlainTail = ut()?.window?.self.chrome.Array;
export const unplannedComputedTail = ut()?.window?.self?.['chrome'];
export const unplannedTwoTails = ut()?.window?.self?.chrome?.foo?.Array;
export const unplannedPlainChain = ut()?.window?.self?.chrome.foo.Array;
const pf = () => globalThis;
export const plainThenLiveOptional = pf()?.window?.self.chrome?.foo.bar;
globalThis.metaHost = { a: 1, b: 2 };
const mt = () => globalThis;
export const opaqueKeyNoEffects = mt()?.window?.self.metaHost[globalThis.flag ? 'a' : 'b'];
export const opaqueKeyRuntimeValue = mt()?.window?.self.metaHost[String('a')];
