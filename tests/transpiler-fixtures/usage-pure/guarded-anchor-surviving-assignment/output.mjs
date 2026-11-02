import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// An assignment applies its surviving claim without replaying the stored receiver.
let saved, name;
name = _nameMaybeFunction((saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Map : saved.Map));
export {};