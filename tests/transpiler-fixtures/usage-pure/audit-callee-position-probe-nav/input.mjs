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
let heldPlain;
export const plainCall = (heldPlain = globalThis)?.window?.self.calleeBox.fn();
let heldOptional;
export const optionalCall = (heldOptional = globalThis)?.window?.self.calleeBox.fn?.();
let heldParen;
export const parenCallee = ((heldParen = globalThis)?.window?.self.calleeBox.fn)();
let heldDot;
export const dotCall = (heldDot = globalThis)?.window?.self.calleeBox.fn.call(globalThis.calleeBox);
export { heldPlain, heldOptional, heldParen, heldDot };

// the polyfilled dispatch over the same shapes: the render stands down and the instance channel
// owns the whole chain
let heldDispatch;
export const polyDispatch = (heldDispatch = globalThis)?.window?.self.calleeBox.list?.at(0);
export const bareDispatch = globalThis.window?.self.calleeBox.list?.at(0);
export const unknownDispatch = globalThis.window?.self.unknownCalleeBox.list?.at(0);
let heldUnknownDispatch;
export const unknownAssignDispatch = (heldUnknownDispatch = globalThis)?.window?.self.unknownCalleeBox.list?.at(0);
// a NON-optional dispatch over the same root: the `?.` on the assign carrier is dead text (the
// write always yields the global), and only one emitter drops it - a spelling split the sidecar
// records, both reading the same value through the same guard
let heldPlainDispatch;
export const plainAssignDispatch = (heldPlainDispatch = globalThis)?.window?.self.unknownCalleeBox.list.at(0);
export { heldDispatch, heldUnknownDispatch, heldPlainDispatch };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.calleeBox.list ? 0 : 1)?.includes('a');
