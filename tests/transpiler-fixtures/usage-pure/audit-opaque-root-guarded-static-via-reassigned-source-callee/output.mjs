import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// NEGATIVE: the callee alias captured the SOURCE before its reassignment - the reassigned
// source bails and the chain keeps the raw guarded read (the capture holds whatever the
// program put there)
let swapMk = () => ({
  window: null
});
const heldMk = swapMk;
swapMk = () => _globalThis;
export const viaReassignedSourceCallee = null == (_ref = heldMk()?.window?.self) ? void 0 : _at(_ref2 = _ref.Array.of(35)).call(_ref2, 0);