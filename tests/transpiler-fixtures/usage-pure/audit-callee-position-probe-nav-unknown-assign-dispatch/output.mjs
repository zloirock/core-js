import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
let heldUnknownDispatch;
export const unknownAssignDispatch = null == (_ref = null == (heldUnknownDispatch = _globalThis).window ? void 0 : _self.unknownCalleeBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export { heldUnknownDispatch };