import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `delete` through a probe guard hands the guard the whole operator: the deleted member stays a
// reference the operator removes, and the short-circuited branch answers the `true` a `delete` over an
// absent chain yields. the tail keeps the source's own `?.` steps, however many steps stand between
// the guard and the operator, over a call root or a bare one.
const ut = () => _globalThis;
export const unplannedDelete = null == ut().window ? true : delete _self?.chrome;
const dl = () => _globalThis;
export const deleteOverPulledTail = null == dl().window ? true : delete _self.chrome.missing;
export const deleteDirectTail = null == dl().window ? true : delete _self.missing;
export const deleteOptionalTail = null == dl().window ? true : delete _self?.chrome?.missing;
_globalThis.deleteNest = {
  key: 1
};
export const deleteBareRootDeepTail = null == _globalThis.window ? true : delete _self.deleteNest.key;
export const deleteBareRootDirect = null == _globalThis.window ? true : delete _self.deleteNest;