import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// A used assignment retains the RHS while the claim guards its constructor read.
let saved, name;
const result = (saved = null == _globalThis.window ? void 0 : _self, name = _nameMaybeFunction(saved === _globalThis ? _Map : saved.Map), saved);
export {};