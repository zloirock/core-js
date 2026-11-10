import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// A write inside the seal keeps its value, and the plain reader still throws.
let held;
use(null == ((null == (held = _globalThis.window) ? void 0 : _self).self, _self) ? void 0 : _Promise$resolve);