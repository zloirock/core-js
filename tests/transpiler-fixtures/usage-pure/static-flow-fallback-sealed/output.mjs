import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const resolve = ((null == _globalThis.window ? void 0 : _self).Promise, _Promise$resolve);
r = typeof resolve;