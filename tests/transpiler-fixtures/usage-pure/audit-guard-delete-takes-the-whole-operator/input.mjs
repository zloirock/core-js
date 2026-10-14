// a `delete` through a probe guard hands the guard the whole operator: the deleted member stays a
// reference the operator removes, and the short-circuited branch answers the `true` a `delete` over an
// absent chain yields. the tail keeps the source's own `?.` steps, however many steps stand between
// the guard and the operator, over a call root or a bare one.
const ut = () => globalThis;
export const unplannedDelete = delete ut()?.window?.self?.chrome;
const dl = () => globalThis;
export const deleteOverPulledTail = delete dl()?.window?.self.chrome.missing;
export const deleteDirectTail = delete dl()?.window?.self.missing;
export const deleteOptionalTail = delete dl()?.window?.self?.chrome?.missing;
globalThis.deleteNest = { key: 1 };
export const deleteBareRootDeepTail = delete globalThis.window?.self.deleteNest.key;
export const deleteBareRootDirect = delete globalThis.window?.self.deleteNest;
