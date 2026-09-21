// A computed static leaf captures the guarded Object value first.
// An absent nav throws before the key effect; a defined nav runs the key effect
// before initializing the pure binding.

let f1 = 0;
export const { Object: { [(f1++, 'freeze')]: viaAnchoredSealedSeKey } } = (globalThis.window?.self);
export { f1 };

// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const { Map: { customY: viaAnchoredSealedCustom } } = (globalThis.window?.self);

// member-read anchor (no whole-ctor pure entry) over a LIVE probe
export const { Math: { floor: viaAnchoredLiveFloor } } = globalThis.window?.self;

// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const { JSON: { stringify: viaAnchoredSealedFull } } = (globalThis.window?.self);

// DEFINED navs keep the plain anchored collapses - no guard, no probe
export const { Math: { trunc: viaDefinedAnchoredTrunc } } = globalThis.self;
export const { Reflect: { ownKeys: viaDefinedAnchoredOwnKeys } } = globalThis;

// for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const { Math: { floor: viaForInitAnchor } } = (globalThis.window?.self); f2 < 1; f2++) { void viaForInitAnchor; }
let f3 = 0;
for (const { [(f3++, 'keys')]: viaForInitSeKey } = (globalThis.window?.self).Object; f3 < 2;) { void viaForInitSeKey; break; }
export { f2, f3 };

// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
globalThis.Map = function PatchedMap() {};
export const { Map: { customY: viaMutatedAnchor } } = (globalThis.window?.self);

// NEGATIVES: resolvable roots/hops keep the collapse, a PARTIAL consume keeps its residual
export const { of: viaDefinedRoot } = globalThis?.Array;
export const { of: viaResolvableHop } = globalThis.self?.Array;
export const { of: viaAllPlainNav } = globalThis.window.Array;
export const { of: viaPartialConsume, ...viaPartialRest } = globalThis.window?.Array;
