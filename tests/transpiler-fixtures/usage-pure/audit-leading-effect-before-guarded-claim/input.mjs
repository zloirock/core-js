// Leading effects precede guarded claims; ordinary constructor keys keep their effect channel.
// Effectful realm keys retain their native guarded access.
let seq = 0;
export const staticClaim = (seq++, globalThis.window?.self)?.Array.of(5);
export const ctorClaim = (seq++, globalThis.window?.self)?.Map;
export const navClaim = (seq++, globalThis.window?.self)?.window.Array.of(6);
export const twoEffects = (seq++, seq++, globalThis.window?.self)?.Array.of(7);
export const invoked = (seq++, globalThis.window?.self)?.Array.from([8]);

export const keyEffectMigrates = globalThis.window?.[(seq++, 'self')].Array.of(9);
export const noEffect = (1, globalThis.window?.self)?.Array.of(10);
export const plainClaim = (seq++, globalThis.window?.self).Array.of(11);

const { window: W } = globalThis;
export const aliasKeyMigrates = W?.[(seq++, 'Array')].of(12);
export const aliasLeading = (seq++, W)?.Array.of(13);
let q;
export const aliasAnchored = (seq++, q = W)?.Array.of(14);
