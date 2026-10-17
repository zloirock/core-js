import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// An SE-bearing hop key MIGRATES into the next surviving key when the pristine hop over a kept proxy root drops.
let c = 0;
// NEGATIVE: `Array` names no pure constructor here, so the surviving key stays a live read off
// the memo and the migrated effects respell it computed - the shape the ctor rows must not take
let d;
export const noCtorKeyRespellsComputed = null == (d = _globalThis.window) ? void 0 : _nameMaybeFunction(d[c++, "Array"]);
export { c };