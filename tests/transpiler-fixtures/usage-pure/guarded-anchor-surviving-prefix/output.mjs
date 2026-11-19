import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// A prefix cannot turn a stored nullable receiver into a defined constructor.
let saved;
const name = _nameMaybeFunction((effect(), saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Map : saved.Map));
export {};