// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
globalThis.Map = function PatchedMap() {};
