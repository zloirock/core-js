// a realm hop whose SLOT this file writes holds the user's own object, and the `delete` fold may not
// drop it - nor the hops BELOW it, which only drop together with the read above them: landing the
// root binding under the kept hop rewrites what that hop reads off. the run keeps every hop and each
// renders its own claim, which is the spelling the READ twin lands, whatever spells the root - and
// whatever stands between the hops, since a source SEAL names the same slot as its bare twin
let store;
function root() { return globalThis; }
globalThis.window = { probe: 1 };
export const viaIdentRoot = delete globalThis.self.window.probe;
export const viaCallRoot = delete root().self.window.probe;
export const viaStoreRoot = delete (store = globalThis).self.window.probe;
export const viaSealedClaim = delete (globalThis.self).window.probe;
export const viaSealedRun = delete (globalThis.self.window).probe;
export const viaReadTwin = globalThis.self.window.probe;

// NEGATIVE: a hop the fold MAY drop still lands the root binding - an ordinary member above the
// claim ends the run without deopting it, and a slot the source never wrote folds with the rest
export const viaOrdinaryAbove = delete globalThis.self.customSlot.probe;
export const viaPristineHop = delete globalThis.self.probe;
export { store };
