import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A self property of a stored user object can be absent; its guard remains live.
let held;
export const value = null == (_ref = (held = _globalThis.host).self) ? void 0 : _at(_ref2 = _ref.list).call(_ref2, 0);
export { held };