import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
_globalThis.assignBox = {
  list: ['ab', 'cd'],
  n: 1
};
let heldDispatch;
export const withDispatch = null == (_ref = null == (heldDispatch = _globalThis).window ? void 0 : _self.assignBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export { heldDispatch };