import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a NON-optional dispatch over the same root: the `?.` on the assign carrier is dead text (the
// write always yields the global), and only one emitter drops it - a spelling split the sidecar
// records, both reading the same value through the same guard
let heldPlainDispatch;
export const plainAssignDispatch = null == (_ref = (heldPlainDispatch = _globalThis)?.window) ? void 0 : _at(_ref2 = _ref.unknownCalleeBox.list).call(_ref2, 0);
export { heldPlainDispatch };