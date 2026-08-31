import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// destructuring off the bare probe: a POLYFILLABLE key extracts with the discarded read
// re-emitted as a throw probe (the consuming-position canon - off-env the probe throws where
// native does, on-env the ponyfill binds); a non-claim key keeps the raw kept hop; the rest
// form binds the ponyfill directly and its residual carries the throw itself
export const viaBareProbePoly = ((null == _globalThis.window ? void 0 : _globalThis.window).Promise, _Promise);
export const {
  customThing: viaBareProbeCustom
} = _globalThis.window;
export const viaBareProbeRestPoly = _Array$of;
export const {
  Array: _unused,
  ...viaBareProbeRest
} = _globalThis.window;

// the value that IS the environment probe: a bare one-hop init (`= globalThis.window`), its
// sealed twin, an agreeing-proxy ternary collapse and an alias HOLDING the probe all consume
// a value that is absent exactly off-env - the probe reads the first key off the guard whose
// test operand doubles as the alternate. resolvable roots keep their collapse, and the deep
// unresolvable hop keeps the accepted realm-self-reference collapse
export const viaBareProbe = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
export const viaBareProbeSealed = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
export const viaBareProbeFlat = ((null == _globalThis.window ? void 0 : _globalThis.window).structuredClone, _structuredClone);
export const viaBareProbeTernary = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
const heldProbe = _globalThis.window;
export const viaBareProbeAlias = ((null == heldProbe ? void 0 : heldProbe).Array, _Array$of);
export const viaDefinedGlobal = _Array$of;
export const viaDefinedSelf = _Array$of;
export const viaDeepSelfRef = _Array$of;