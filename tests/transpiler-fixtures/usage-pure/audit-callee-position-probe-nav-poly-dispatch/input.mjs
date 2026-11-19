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
// the polyfilled dispatch over the same shapes: the render stands down and the instance channel
// owns the whole chain
let heldDispatch;
export const polyDispatch = (heldDispatch = globalThis)?.window?.self.calleeBox.list?.at(0);
export { heldDispatch };
