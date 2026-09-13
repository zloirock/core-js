// Plain parameter and inner defaults synthesize covered keys even when an optional host is absent.
// Supplied arguments and logical-left branches preserve branch selection and their live static polyfills.
// Flat sealed reads still throw; unresolved sibling keys retain their receiver reads.
// Alias-held and nested defaults keep their fallback forms, and receiver effects run once.

// flat synth-swap, plain optional nav receiver
export function viaParamFlat({ of } = globalThis.window?.Array) { return of; }

// flat synth-swap, SEALED receiver read: the probe survives in the fallback slot
export function viaParamSealed({ of } = (globalThis.window?.self).Array) { return of; }

// flat synth-swap, alias-held receiver
const heldCtor = globalThis.window?.Array;
export function viaParamAlias({ of } = heldCtor) { return of; }

// A supplied IIFE argument preserves the optional host guard before destructuring.
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
// The logical left keeps its nullish branch so the rescue still runs when the host is absent.
export function viaLogicalRescue({ of } = globalThis.window?.Array ?? {}) { return of; }
