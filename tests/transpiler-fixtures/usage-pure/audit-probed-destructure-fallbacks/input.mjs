// a `||` / `??` FALLBACK rescues the nullish path: the left swaps for a synth carrying the
// probe's own nullish guard, so a diverging fallback still fires exactly off-env, an agreeing
// ctor fallback keeps the per-branch machinery, and a SEALED left THROWS instead of selecting -
// its dead fallback drops while the probe stays
export const { of: viaFallbackObject } = globalThis.window?.Array ?? {};
export const { of: viaFallbackOr } = globalThis.window?.Array || {};
export const { of: viaFallbackAgree } = globalThis.window?.Array ?? Array;
export const { of: viaFallbackSealed } = (globalThis.window?.self).Array ?? {};
export const { self: { Array: { of: viaFallbackNested } } } = globalThis.window ?? {};
