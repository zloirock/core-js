import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A later assignment captures the window probe before an optional instance read.
// The receiver memo retains both the source alias proof and the environment guard.
// The second window read has its own guard; a prior capture cannot prove it present.
let realm;
realm = _globalThis.window;
export const value = null == (_ref = realm?.window) ? void 0 : _at(_ref2 = _ref.items).call(_ref2, -1);