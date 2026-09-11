// destructuring off the bare probe: a POLYFILLABLE key extracts with the discarded read
// re-emitted as a throw probe (the consuming-position canon - off-env the probe throws where
// native does, on-env the ponyfill binds); a non-claim key keeps the raw kept hop; the rest
// form binds the ponyfill directly and its residual carries the throw itself
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
