import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// An outer store keeps the possibly absent value of the user's self property.
let held, inner;
export const value = null == (_ref = held = (inner = _globalThis.host).self) ? void 0 : _includes(_ref2 = _ref.list).call(_ref2, 1);
export { held, inner };