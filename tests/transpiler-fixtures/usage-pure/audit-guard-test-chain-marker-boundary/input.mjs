// the guard test's carve asks by SHAPE whether a claim is the read the TEST performs, and a memo
// carries the source's own chain into that test whole. past the chain MARKER the claim is the
// source's read again, so the realm-hop collapse it takes unguarded is the one it takes here
let n = 0;
globalThis.markerBox = { list: [[1]] };
const provenRoot = () => globalThis;
const provenProbe = () => globalThis.window;

// the memo holds the source's chain: the run collapses onto the root ponyfill, marker or not
export const memoCarriedChain = provenRoot()?.window.markerBox?.at(0);
export const memoCarriedChainDeep = provenRoot()?.window.markerBox.list?.flat();
export const memoCarriedSeqRoot = (n++, provenRoot())?.window.markerBox?.at(0);
// NEGATIVE: the same nav with no guard to mint - the collapse the rows above have to match
export const unguardedTwin = provenRoot().window.markerBox.list;
// NEGATIVE: a probe-yielding root's `?.` is load-bearing, so the test IS the read the render
// performs and the hops below it fold onto the tested value
export const probeYieldTest = provenProbe()?.self?.window.markerBox.list;
export { n };
