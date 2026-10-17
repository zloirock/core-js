import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
_globalThis.assignBox = {
  list: ['ab', 'cd'],
  n: 1
};
let heldPlain;
export const withPlainTail = null == (heldPlain = _globalThis).window ? void 0 : _self.assignBox.n;
export { heldPlain };