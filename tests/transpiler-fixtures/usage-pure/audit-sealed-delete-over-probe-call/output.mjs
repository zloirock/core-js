import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `delete` over a navigation rooted at a call yielding the environment PROBE keeps the guard on
// the call: that `?.` decides whether the delete happens (open form) or whether the sealed read
// throws (sealed form) - the call canon's yield question, asked by the delete-guard verdict like a
// probe read's. the terminal `window` probe between the guard and the deleted slot reads the
// always-defined alternate and folds onto the ponyfill - the same realm object on every host - on
// both legs, the deleted member alone standing outside the guard
const dh = () => _globalThis.window;
export const sealedOverCall = delete (null == dh() ? void 0 : _self).customSlot;
export const openOverCall = delete (null == dh() ? void 0 : _self)?.customSlot;