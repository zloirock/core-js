import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// what a realm run rides when this BUILD cannot spell its root: the entry exists in the package and
// the configuration excluded it, so nothing may substitute the root itself - but the canon judges a
// hop by the entry EXISTING, and `web.self` was not excluded, so the run still rides the deepest
// span pure can back. marking those hops handled would strand the whole run raw, which is the one
// spelling the pure method exists to prevent
let q;
export const probeRun = _self.window;
export const navigated = _self.Array;
export const value = _self;
export const claimThrough = _self.window.Map;
export const storeThrough = _nameMaybeFunction((q = _self.window).Map);

// ... and every consumer of such a run rides the same span: a `delete` reaches its slot off it, and
// a dispatch above it reads its receiver through it - a plan that stood down here left the whole
// navigation raw, the one spelling the pure method exists to prevent
const box = {
  self: {}
};
export const deleteRun = delete _self.window;
export const deleteAboveDispatch = delete _at(_self.box.list).name;
export const readAboveDispatch = _nameMaybeFunction(_at(_self.box.list));

// ... and a hop reached through a COMPUTED key rides the same span: what its key DID re-emits ahead
// of the binding, exactly as the kept-root canon spells it - refusing the key here left the whole run
// raw on one leg while the other rode it
let e = 0;
export const seKeyedHop = (e++, _self).box.list;
export { e };

// NEGATIVE: the excluded root read on its own has nothing to ride - it stays the source's own read
export const bareRoot = globalThis;
export { q };