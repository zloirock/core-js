import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A `delete` folds the guards of the navigation it reaches its slot through, except a live `?.` over
// the `window` probe itself: that one decides whether the delete happens at all (with no `window` the
// source leaves `chrome` alone), so its guard stays and takes the whole operator. A `?.` over a hop
// pure always spells (`self`) folds with the rest.
_globalThis.chrome = {
  probeSlot: 1
};
_globalThis.deleteBox = {
  slot: 1,
  nested: {
    slot: 2
  }
};
const ut = () => _globalThis;
let st;
// KEPT: the `?.` guards the `window` probe read
export const probeGuarded = null == ut().window ? true : delete _self?.chrome;
// ... whatever tail the deleted member hangs off
export const probeGuardedPlainTail = null == ut().window ? true : delete _self.deleteBox;
export const probeGuardedDeepTail = null == ut().window ? true : delete _self.deleteBox.nested.slot;
// FOLDED: the `?.` is over `self`, a hop the pure package spells - always defined after the swap
export const resolvableHopFolds = delete _globalThis.Promise;
// KEPT: the probe read off a span pure lands always-defined is the environment probe too, and a
// seal changes nothing about that - the delete happens exactly where the source's `?.` says
export const sealedDeepProbeKeeps = delete (null == _self.window ? void 0 : _self).deleteBox;
// ... a STORE at the run's root spells the same span and keeps it, running once inside the test
export const storedRootProbeKeeps = null == (st = _globalThis, _self).window ? true : delete _self.deleteBox;
// ... and so does a deeper tail, the second one ending on a method name (`at`) off a container the
// file never writes
export const deepTailProbeKeeps = null == _self.window ? true : delete _self.deleteBox.nested.slot;
export const deepTailClaimedName = null == _self.window ? true : delete _self.untouchedBox.at;
export { st };