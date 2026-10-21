import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A constructor leaf key keeps its effects after the receiver store.
// An effectful realm-hop key retains its source read after that store.
let m;
let c = 0;
export const seClaimKey = _nameMaybeFunction((m = _globalThis.window, c++, _Set));
let p;
let k = 0;
export const seProxyKey = _nameMaybeFunction((p = _globalThis.window)[k++, 'self'].Map);