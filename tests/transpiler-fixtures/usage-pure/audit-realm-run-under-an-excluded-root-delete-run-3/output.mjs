import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// Excluding the bare realm entry keeps that root native. A permitted backed hop may still supply the deepest available ponyfill
// for the continuation.
let q;
export const storeThrough = _nameMaybeFunction((q = _self, _Map));
export const deleteRun = delete _self.window;
export { q };