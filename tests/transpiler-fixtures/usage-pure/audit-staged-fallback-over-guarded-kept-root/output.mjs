import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// the member is not itself polyfilled, so its RECEIVER carries the claim - but the ctor-fallback
// swap has no slot for the chain-assignment the receiver buries and stages instead. the ctor read
// below it must then keep its own render: standing down for a consumer that emits nothing shipped
// the constructor raw, and off-realm that read is the missing polyfill
var v;
var w;
export const staged = null == (v = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise.noSuchStatic;
export const twin = null == (w = null == _globalThis.window ? void 0 : _self) ? void 0 : _Set.noSuchStatic;
export const seen = [v, w];