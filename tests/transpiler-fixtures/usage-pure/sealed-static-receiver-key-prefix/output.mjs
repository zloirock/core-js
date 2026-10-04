import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
// A computed constructor key sits below an optional realm probe and a seal.
// Absence skips the key before the sealed static read throws.
// A present receiver evaluates the key once, after the probe and before the instance call.
// Pure substitution preserves that order while supplying the static and instance entries.
let keyReads = 0;
export const value = _toFixedMaybeNumber(((null == _globalThis.window ? void 0 : (keyReads++, Number)).MAX_SAFE_INTEGER, _Number$MAX_SAFE_INTEGER)).call(_Number$MAX_SAFE_INTEGER, 2);
export { keyReads };