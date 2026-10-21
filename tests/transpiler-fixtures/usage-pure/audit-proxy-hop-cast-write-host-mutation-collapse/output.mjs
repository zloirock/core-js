import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Quiet TS-wrapped mutation receivers keep their write target on the backed realm.
// An effectful realm key keeps the native receiver and its key effect.
let e = 0;
(_globalThis.Set as any) = function () {};
(_self.Map as any) = function () {};
(_globalThis[e++, 'window'].WeakSet as any) = function () {};