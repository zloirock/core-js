// the chain END sitting in CALLEE position. a POLYFILLED dispatch there owns the chain - it has
// already memoized the receiver and rebuilt the call, so a kept-nav render over its callee would
// wrap that rebuild and the invocation would lose its receiver. a PLAIN user call claims nothing,
// so the nav under it still owes its render, and both emitters must draw that line in one place
globalThis.calleeBox = {
  list: ['ab', 'cd'],
  tag: 'box',
  fn() {
    return this && this.tag === 'box' ? 'kept' : 'LOST';
  },
};
let heldOptional;
export const optionalCall = (heldOptional = globalThis)?.window?.self.calleeBox.fn?.();
export { heldOptional };
