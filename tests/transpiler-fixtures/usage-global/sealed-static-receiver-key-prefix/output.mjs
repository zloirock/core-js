import "core-js/modules/es.string.repeat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
// A computed constructor key sits below an optional realm probe and a seal.
// Absence skips the key before the sealed static read throws.
// A present receiver evaluates the key once, after the probe and before the instance call.
// Pure substitution preserves that order while supplying the static and instance entries.
let keyReads = 0;
export const value = (globalThis.window?.[keyReads++, 'Number']).MAX_SAFE_INTEGER.toFixed(2);
export { keyReads };