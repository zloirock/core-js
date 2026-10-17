import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
let s;
let k = 0;
// a computed key-SE rides the guard's non-null branch (native evaluates the key only when the
// chain does not short-circuit), ordered after the claim like the source reads it
export const doubleHopKeySe = null == (s = _globalThis.window) ? void 0 : (k++, _nameMaybeFunction(_Set));