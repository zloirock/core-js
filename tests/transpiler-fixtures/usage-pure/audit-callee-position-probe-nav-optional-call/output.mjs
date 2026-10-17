import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the chain END sitting in CALLEE position. a POLYFILLED dispatch there owns the chain - it has
// already memoized the receiver and rebuilt the call, so a kept-nav render over its callee would
// wrap that rebuild and the invocation would lose its receiver. a PLAIN user call claims nothing,
// so the nav under it still owes its render, and both emitters must draw that line in one place
_globalThis.calleeBox = {
  list: ['ab', 'cd'],
  tag: 'box',
  fn() {
    return this && this.tag === 'box' ? 'kept' : 'LOST';
  }
};
let heldOptional;
export const optionalCall = null == (heldOptional = _globalThis).window ? void 0 : _self.calleeBox.fn?.();
export { heldOptional };