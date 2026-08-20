// param-default / IIFE-arg / inner-default synth-swaps over an UNDEFINABLE receiver keep the
// plain always-defined literal: the caller-correct fallback slot fires only when nothing was
// passed, and the ponyfill resolves where native would throw on the absent host - the accepted
// divergence the provider AGENTS.md spells. the one exception rides the SEAL rule, not this
// one: a sealed receiver read in the flat synth-swap re-emits as a throw probe (the source
// itself spells the read the swap would erase), while the nested mirror stays plain on every
// spelling

// flat synth-swap, plain optional nav receiver
export function viaParamFlat({ of } = globalThis.window?.Array) { return of; }

// flat synth-swap, SEALED receiver read: the probe survives in the fallback slot
export function viaParamSealed({ of } = (globalThis.window?.self).Array) { return of; }

// flat synth-swap, alias-held receiver
const heldCtor = globalThis.window?.Array;
export function viaParamAlias({ of } = heldCtor) { return of; }

// flat synth-swap, IIFE argument position
export const viaIifeArg = (({ of }) => of)(globalThis.window?.Array);

// flat synth-swap, inner destructure default
export const { propA: { of: viaInnerDefault } = globalThis.window?.Array } = {};

// flat synth-swap, sequence-prefixed receiver (the prefix stays around the swap)
let e1 = 0;
export function viaParamSeq({ of } = (e1++, globalThis.window?.Array)) { return [of, e1]; }

// flat synth-swap, unresolved sibling key still reads the receiver
export function viaParamMixed({ of, customZ } = globalThis.window?.Array) { return [of, customZ]; }

// nested mirror, plain optional deep nav receiver
export function viaMirrorNested({ Array: { of } } = globalThis.window?.self) { return of; }

// nested mirror, sealed receiver
export function viaMirrorSealed({ Array: { of } } = (globalThis.window?.window).self) { return of; }

// nested mirror, passthrough sibling beside the polyfilled leaf
export function viaMirrorPassthrough({ Math: { floor }, Array: { of } } = globalThis.window?.self) { return [floor, of]; }

// nested mirror in a runtime ternary
let cond1 = false;
export function viaMirrorTernary({ Array: { of } } = cond1 ? globalThis.window?.self : { Array: { of: () => 1 } }) { return of; }

// defined receivers render the same way
export function viaDefinedSelf({ of } = globalThis.self.Array) { return of; }
export function viaDefinedMirror({ Array: { of } } = globalThis.self) { return of; }
export function viaLogicalRescue({ of } = globalThis.window?.Array ?? {}) { return of; }
