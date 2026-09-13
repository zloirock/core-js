// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// The exported constructor includes its static methods for external consumers.
export const { Promise: viaBareProbePoly } = globalThis.window;
export const { customThing: viaBareProbeCustom } = globalThis.window;
export const { Array: { of: viaBareProbeRestPoly }, ...viaBareProbeRest } = globalThis.window;

// the value that IS the environment probe: a bare one-hop init (`= globalThis.window`), its
// sealed twin, an agreeing-proxy ternary collapse and an alias HOLDING the probe all consume
// a value that is absent exactly off-env - the probe reads the first key off the guard whose
// test operand doubles as the alternate. resolvable roots keep their collapse, and the deep
// unresolvable hop keeps the accepted realm-self-reference collapse
export const { Array: { of: viaBareProbe } } = globalThis.window;
export const { Array: { of: viaBareProbeSealed } } = (globalThis.window);
export const { structuredClone: viaBareProbeFlat } = globalThis.window;
export const { Array: { of: viaBareProbeTernary } } = globalThis.setTimeout ? globalThis.window : globalThis.window;
const heldProbe = globalThis.window;
export const { Array: { of: viaBareProbeAlias } } = heldProbe;
export const { Array: { of: viaDefinedGlobal } } = globalThis;
export const { Array: { of: viaDefinedSelf } } = globalThis.self;
export const { Array: { of: viaDeepSelfRef } } = globalThis.self.window;
