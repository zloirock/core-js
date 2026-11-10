import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// A plain hop through a sealed optional must throw before the outer guard.
use(null == ((null == _globalThis.window ? void 0 : _self).self, _self) ? void 0 : _Promise$resolve);