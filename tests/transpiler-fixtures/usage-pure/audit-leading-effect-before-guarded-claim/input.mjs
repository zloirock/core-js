// an effect the source wrote AHEAD of a guarded claim's root has a home of its own: it evaluates
// before the guard test, so it wraps the whole claim. the SE classifier knew only two regions -
// inside the test and between the root and the claim - and a sequence prefix therefore left the
// claim standing down RAW: an unpolyfilled static plus a raw global read on the target engine.
let seq = 0;
export const staticClaim = (seq++, globalThis.window?.self)?.Array.of(5);
export const ctorClaim = (seq++, globalThis.window?.self)?.Map;
export const navClaim = (seq++, globalThis.window?.self)?.window.Array.of(6);
export const twoEffects = (seq++, seq++, globalThis.window?.self)?.Array.of(7);
export const invoked = (seq++, globalThis.window?.self)?.Array.from([8]);

// the region between the root and the claim still migrates INTO the guarded branch, in native order
export const keyEffectMigrates = globalThis.window?.[(seq++, 'self')].Array.of(9);
// NEGATIVE: an effect-free prefix has nothing to carry - the claim renders bare
export const noEffect = (1, globalThis.window?.self)?.Array.of(10);
// NEGATIVE: the plain (unguarded) claim keeps its own probe spelling
export const plainClaim = (seq++, globalThis.window?.self).Array.of(11);

// the ALIAS spelling of the same regions: the probe is the alias binding itself, and a dropped
// key effect still runs only INSIDE the branch (native short-circuits past the key), while a
// leading prefix stays ahead of the whole ternary
const { window: W } = globalThis;
export const aliasKeyMigrates = W?.[(seq++, 'Array')].of(12);
export const aliasLeading = (seq++, W)?.Array.of(13);
// a KEPT WRITE anchors the prefix - the sequence stays whole inside the test beside it
let q;
export const aliasAnchored = (seq++, q = W)?.Array.of(14);
