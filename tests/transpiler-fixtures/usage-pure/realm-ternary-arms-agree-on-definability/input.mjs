// A ternary selecting the realm is decided by its TEST, so naming the same proxy is not enough to
// collapse it away. An arm the environment may not have still takes the literal, through a null test
// on the probe's own read: absent, the arm yields the probe and the read through it throws where
// native throws; present, the polyfill wins - and a host that spells the probe is the only one that
// ever runs that arm. Arms of the same KIND collapse whole - both probes carry the probe verdict on
// the operand yielded, both guaranteed collapse outright - and a logical fallback collapses on its
// VALUE, its nullish path rescued by the right operand.
const flagged = globalThis.flagged;
const { Array: { of: viaProbeArm } } = flagged ? globalThis.window : globalThis;
const { Map: { groupBy: viaBothProbes } } = flagged ? globalThis.window : globalThis.window;
const { Promise: { race: viaBothGuaranteed } } = flagged ? globalThis : globalThis;
const { Iterator: { from: viaLogical } } = globalThis.window ?? globalThis;
export { viaProbeArm, viaBothProbes, viaBothGuaranteed, viaLogical };
