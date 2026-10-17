import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// the same shapes over a tail name this file never writes: the detector knows nothing about it,
// which is exactly the case the suppressed hop used to swallow
let heldUnknown;
export const unknownTail = null == (_ref = null == (heldUnknown = _globalThis).window ? void 0 : _self.unknownBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export { heldUnknown };