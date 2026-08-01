// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings (which would erase the throw and
// run computed-key effects the source never reaches)

// SE-computed-key leaf under a static-ctor pattern hop: extraction + guarded residual (the
// key effect and the throw both live in the residual read)
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

// a REST sibling declines the single-prop anchor: the flat residual keeps the guard-value
// init (an always-defined receiver binding would erase the probe's throw AND hand rest the
// realm global); a flat PARTIAL consume off a probed member nav rides the same guard
export const { Math: { trunc: viaRestDeclinedAnchor }, ...viaRestRest } = (globalThis.window?.self);
export const { isInteger: viaPartialProbed, customZ: viaPartialCustom } = globalThis.window?.self.Number;

// FULL consumes outside the anchor gate carry the same once-per-pattern probe: multi-prop
// nested, single-level flat (the probe read is the pattern key itself), array-wrapped
// (the probe value is the descended element), and the assignment-host cascade
export const { Math: { cbrt: viaMultiPropA }, Object: { seal: viaMultiPropB } } = (globalThis.window?.self);
export const { structuredClone: viaFlatBareNav } = (globalThis.window?.self);
export const [{ Math: { hypot: viaArrayWrapped } }] = [(globalThis.window?.self)];
let viaAssignFull;
({ Math: { sign: viaAssignFull } } = (globalThis.window?.self));
export { viaAssignFull };

// CALL-rooted probe navs: the guard test owns the single root-call run (a PURE proven call
// stays verbatim in the test; an SE call must not be replayed by the discard harvest; an
// identity-IIFE root substitutes its buried global)
const dhPure = () => globalThis;
export const { Math: { expm1: viaCallRootPure } } = (dhPure().window?.self);
let callRootEff = 0;
const dhSe = () => { callRootEff++; return globalThis; };
export const { JSON: { parse: viaCallRootSe } } = (dhSe().window?.self);
export const { Object: { values: viaCallRootIife } } = ((x => x)(globalThis).window?.self);
export { callRootEff };
