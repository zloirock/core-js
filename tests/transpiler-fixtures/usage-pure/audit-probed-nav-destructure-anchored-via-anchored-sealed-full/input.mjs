// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const { JSON: { stringify: viaAnchoredSealedFull } } = (globalThis.window?.self);
