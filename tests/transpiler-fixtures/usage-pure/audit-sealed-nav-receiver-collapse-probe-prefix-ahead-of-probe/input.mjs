// an effect the source wrote BEFORE the nav runs before the read the probe reproduces: a sequence
// prefix is not part of the guarded value and may not migrate behind it
export let seq = 0;
export const prefixAheadOfProbe = ((seq++, globalThis.window?.self)).Array.of(1);
