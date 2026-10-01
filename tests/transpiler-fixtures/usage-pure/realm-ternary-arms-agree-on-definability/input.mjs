// Realm selections keep environment-dependent probes and user fallbacks.
// An absent probe throws where the source throws; a present arm supplies its pure static.
const flagged = globalThis.flagged;
const { Array: { of: viaProbeArm } } = flagged ? globalThis.window : globalThis;
const { Map: { groupBy: viaBothProbes } } = flagged ? globalThis.window : globalThis.window;
const { Promise: { race: viaBothGuaranteed } } = flagged ? globalThis : globalThis;
const { Iterator: { from: viaLogical } } = globalThis.window ?? globalThis;
export { viaProbeArm, viaBothProbes, viaBothGuaranteed, viaLogical };
