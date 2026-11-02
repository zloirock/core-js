import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// Nested prefixes retain their order ahead of the stored nullable receiver.
let saved;
const name = _nameMaybeFunction((effect(), other(), saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Map : saved.Map));
export {};