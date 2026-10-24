import _self from "@core-js/pure/actual/self";
// Excluding the bare realm entry keeps that root native. A permitted backed hop may still supply the deepest available ponyfill
// for the continuation.
let q;
export const deleteRun = delete _self.window;
export const guardedOverStore = (q = globalThis, _self).window?.customProp;
export { q };