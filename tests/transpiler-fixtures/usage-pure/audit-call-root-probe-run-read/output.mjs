import _globalThis from "@core-js/pure/actual/global-this";
// the positional fold base for a claimless CALL-rooted read: a run of ONLY probe hops keeps
// the probe read spelled (only the call swaps for the root ponyfill - the throw native keeps),
// while one BACKED hop anywhere makes the run a read THROUGH a ponyfill and it folds whole
const dh = () => _globalThis;
export const probeOnlyRead = String(_globalThis.window.customQ);
export const probeOnlyValue = typeof _globalThis.window.Array;
export const backedThenProbeRead = String(_globalThis.customQ);
export const probeThenBackedRead = String(_globalThis.customQ);