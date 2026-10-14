import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `delete` over a navigation rooted at a call yielding the environment PROBE keeps the guard on the
// call: that `?.` decides whether the delete happens (the open form hands the guard the whole operator)
// or whether the sealed read throws (the sealed form). the terminal `window` hop past `self` reads the
// always-defined alternate and folds onto the ponyfill, the same realm object on every host.
const dh = () => _globalThis.window;
export const sealedOverCall = delete (null == dh() ? void 0 : _self).customSlot;
export const openOverCall = null == dh() ? true : delete _self.customSlot;