// The exported constructor includes its static methods for external consumers.
export const { Promise: viaBareProbePoly } = globalThis.window;
export const { customThing: viaBareProbeCustom } = globalThis.window;
export const { Array: { of: viaBareProbeRestPoly }, ...viaBareProbeRest } = globalThis.window;

// The bare window read and its sealed twin consume the source once, as does an alias holding
// that value. Resolving a root or a deep self-reference still allows the realm to collapse.
export const { Array: { of: viaBareProbe } } = globalThis.window;
export const { Array: { of: viaBareProbeSealed } } = (globalThis.window);
export const { structuredClone: viaBareProbeFlat } = globalThis.window;
export const { Array: { of: viaBareProbeTernary } } = globalThis.setTimeout ? globalThis.window : globalThis.window;
const heldProbe = globalThis.window;
export const { Array: { of: viaBareProbeAlias } } = heldProbe;
export const { Array: { of: viaDefinedGlobal } } = globalThis;
export const { Array: { of: viaDefinedSelf } } = globalThis.self;
export const { Array: { of: viaDeepSelfRef } } = globalThis.self.window;
