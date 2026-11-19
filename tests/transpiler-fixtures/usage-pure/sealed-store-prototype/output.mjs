import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// A constructor fallback keeps the read through the seal before its prototype.
let held;
use(((null == (held = _globalThis.window) ? void 0 : _self).Promise, _Promise).prototype.finally);