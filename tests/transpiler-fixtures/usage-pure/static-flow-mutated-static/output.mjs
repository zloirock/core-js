import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
_Promise.resolve = function own() {};
const name = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Promise, _Promise).resolve);
r = name;