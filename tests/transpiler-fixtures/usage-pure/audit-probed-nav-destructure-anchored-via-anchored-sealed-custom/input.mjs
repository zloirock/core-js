// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const { Map: { customY: viaAnchoredSealedCustom } } = (globalThis.window?.self);
// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
globalThis.Map = function PatchedMap() {};
