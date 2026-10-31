// a `delete` over a navigation rooted at a call yielding the environment PROBE keeps the guard on the
// call: that `?.` decides whether the delete happens (the open form hands the guard the whole operator)
// or whether the sealed read throws (the sealed form). the terminal `window` hop past `self` reads the
// always-defined alternate and folds onto the ponyfill, the same realm object on every host.
const dh = () => globalThis.window;
export const sealedOverCall = delete (dh()?.self?.window).customSlot;
export const openOverCall = delete dh()?.self?.window.customSlot;
