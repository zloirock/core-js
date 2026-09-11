import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a realm hop whose SLOT this file writes holds the user's own object, and the `delete` fold may not
// drop it - nor the hops BELOW it, which only drop together with the read above them: landing the
// root binding under the kept hop rewrites what that hop reads off. the run keeps every hop and each
// renders its own claim, which is the spelling the READ twin lands, whatever spells the root - and
// whatever stands between the hops, since a source SEAL names the same slot as its bare twin
let store;
function root() {
  return _globalThis;
}
_globalThis.window = {
  probe: 1
};
export const viaIdentRoot = delete _self.window.probe;
export const viaCallRoot = delete _self.window.probe;
export const viaStoreRoot = delete (store = _globalThis, _self).window.probe;
export const viaSealedClaim = delete _self.window.probe;
export const viaSealedRun = delete _self.window.probe;
export const viaReadTwin = _self.window.probe;

// NEGATIVE: a hop the fold MAY drop still lands the root binding - an ordinary member above the
// claim ends the run without deopting it, and a slot the source never wrote folds with the rest
export const viaOrdinaryAbove = delete _globalThis.customSlot.probe;
export const viaPristineHop = delete _globalThis.probe;
export { store };