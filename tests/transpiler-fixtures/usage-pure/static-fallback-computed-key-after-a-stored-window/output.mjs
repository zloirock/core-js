import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// The root prefix and store run before the test. The computed constructor key runs only in its live arm.
let held;
export const value = null == (prefix(), held = _globalThis.window) ? void 0 : (key(), _Map).unknown;