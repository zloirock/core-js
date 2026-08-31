// the positional fold base for a claimless CALL-rooted read: a run of ONLY probe hops keeps
// the probe read spelled (only the call swaps for the root ponyfill - the throw native keeps),
// while one BACKED hop anywhere makes the run a read THROUGH a ponyfill and it folds whole
const dh = () => globalThis;
export const probeOnlyRead = String(dh().window.customQ);
export const probeOnlyValue = typeof dh().window.Array;
export const backedThenProbeRead = String(dh().self.window.customQ);
export const probeThenBackedRead = String(dh().window.self.customQ);
